---
title: "WireGuard with UI for Nuspace.kz"
meta_title: "WireGuard with UI for Nuspace.kz"
description: "WireGuard VPN with UI using wg-easy I implemented for Nuspace.kz project."
date: 2026-07-22T12:12:12Z
image: "images/thumbnail.jpg"
categories: ["Guide"]
author: "Bakhtiyar Yesbolsyn"
tags: ["Cloud technologies"]
draft: false
featured: true
---

## Introduction

In the part 1 we have set up a simple monitoring stack that looks after our services running on Docker. 

At the time I wrote the first post about monitoring I didn't quite understand how we did our VPN to be honest 🤠 Recently I got a chance at my internship to get more into it. Got inspired by how easy and intuitive it was on the MikroTik Smart Switch with its WinBox utility and wanted something similar on [Nuspace](https://github.com/ulanpy/nuspace/commit/8e0ce26b97a94aa84410b0af3ee2af34d716f82a). 

> [Deleted production our database with no backups](https://www.linkedin.com/posts/sagyzdop_devopsjourney-operationalexcellence-failforward-share-7470533874662436864-0dix/?utm_source=share&utm_medium=member_desktop&rcm=ACoAADtUwWYB6XjFLkdk8NKglCTbGo2MK3fjFzQ) in the process by accident, but that's another story.

Up to recently we had a headless WireGuard, which was kind of a pain to work with. Well, for a small team like ours with only me and Ulan needing direct access to the production server we only had to configure it once at the beginning. But with scalability and the prospect of handing the project down to the next generation in mind making it more convenient was a good objective. Also it's just fun to try new things. 

It's arguably much easier to work with UI. I found `wg-easy` more than enough for our purposes. The reason we didn't have it from the start, allegedly, was because when we connected to VPN our internet stopped working, or all the traffic had to go trough the production server. 

## Configuration

Setup is quite straightforward. This is the Docker compose file provided in the [official docs](https://wg-easy.github.io/wg-easy/v15.3/examples/tutorials/basic-installation/):

```yaml
volumes:
  etc_wireguard:

services:
  wg-easy:
    #environment:
    #  Optional:
    #  - PORT=51821
    #  - HOST=0.0.0.0
    #  - INSECURE=false

    image: ghcr.io/wg-easy/wg-easy:15
    container_name: wg-easy
    networks:
      wg:
        ipv4_address: 10.42.42.42
        ipv6_address: fdcc:ad94:bacf:61a3::2a
    volumes:
      - etc_wireguard:/etc/wireguard
      - /lib/modules:/lib/modules:ro
    ports:
      - "51820:51820/udp"
      - "51821:51821/tcp"
    restart: unless-stopped
    cap_add:
      - NET_ADMIN
      - SYS_MODULE
      # - NET_RAW # ⚠️ Uncomment if using Podman
    sysctls:
      - net.ipv4.ip_forward=1
      - net.ipv4.conf.all.src_valid_mark=1
      - net.ipv6.conf.all.disable_ipv6=0
      - net.ipv6.conf.all.forwarding=1
      - net.ipv6.conf.default.forwarding=1

networks:
  wg:
    driver: bridge
    enable_ipv6: true
    ipam:
      driver: default
      config:
        - subnet: 10.42.42.0/24
        - subnet: fdcc:ad94:bacf:61a3::/64
```

One change we made to this default aside from using our own Docker network was the port to wg-easy's UI port to `"127.0.0.1:51821:51821/tcp"`. This is done for security purposes, and it deserves its own side note. 

## gcloud and ssh

We have configured our Google Cloud to use [Identity-Aware Proxy (IAP)](https://cloud.google.com/security/products/iap). It is a very useful feature that allows "verifying user identity and use context to determine if a user should be granted access", and "work from untrusted networks without the use of a VPN".

In this context we use it for generating the very first WireGuard configs. `wg-easy` UI is under the port `51821`, which we serve under the root of `vpn.nuspace.kz` using NGINX:

```nginx
# VPN-only
  server {
    listen 443 ssl;
    server_name vpn.nuspace.kz;

    allow 172.28.0.0/24; # Docker network (all containers)
    allow 10.13.13.0/24; # WireGuard clients
    deny all;
    
    # wg-easy Web UI — served at root since it doesn't support sub-paths
    location / {
      proxy_pass http://wg-easy:51821/;
      proxy_http_version 1.1;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
    }
    ...
```

Basically, with IAP we can grant only specific Google accounts `ssh` access to server via `gcloud-cli`. Using local ssh port forwarding with `-L 51821:127.0.0.1:51821` flag, we forward the port `127.0.0.1:51821` to user. Security comes from the fact that`127.0.0.1:` part in compose file exposes it to only local network, so it is not open to public internet.

The complete `gcloud` command looks like this (assuming default region and zone are set up):

```sh
gcloud compute ssh user@instance --tunnel-through-iap -- -L 51821:127.0.0.1:51821
```

Then the UI is accessible from the browser at `localhost:51821. 

## More

Our university's network might block WireGuard traffic if there are multiple simultaneous VPN connections, so using mobile is recommended. 

Moreover, initially we had a convenient handle at `vpn.nuspace.kz` that had links to our monitoring stack.

![](RESOURCES/Screenshot%202026-07-23%20at%2014.41.51.png)Unfortunately the newest version 15 of `wg-easy` does not support serving under subpath for some reason. So now it moved to `/monitoring`, while the root serves the `wg-easy` UI. Makes more sense this way, I guess, but you have to just know it now.

Moreover, the unfortunate naming of "Allowed IPs" for clients caused me a lot of confusion. What it means is – "traffic to which IPs from the client is routed through the tunnel". It might as well have been called "VPN routed IPs" or something. `wg-easy` admin panel allows us to set it up, so all the newly created clients get it right away.

There we have two IPs. One is the server's public IP, and the second one is internal IP of its physical interface. And here comes another interesting thing about the setup.

## Our Golden Firewall Rule

Another way we can ssh into the server is through an identity file and VPN, bypassing the aforementioned IAP. But only through its internal IP with `ssh -i /path/to/private_key username@internalIP`. Why is that?

From [`/terraform/network.tf` file ](https://github.com/ulanpy/nuspace/blob/main/terraform/network.tf) we can see that ssh access is allowed only from WireGuard subnet, or through IAP:

```terraform
...
# Default-like rules for basic access (SSH/ICMP/internal)
resource "google_compute_firewall" "allow_ssh" {
  name    = "allow-ssh-ingress"
  network = google_compute_network.main.name

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  source_ranges = [var.wireguard_subnet_cidr]
}

# Allow SSH via IAP only (no public 22).
# Source range is fixed by Google for IAP TCP forwarding.
resource "google_compute_firewall" "allow_ssh_iap" {
  name    = "allow-ssh-iap-ingress"
  network = google_compute_network.main.name

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  source_ranges = ["35.235.240.0/20"]
  target_tags   = var.vm_instance_tags
}
...
```

From [`terraform/variables.tf`](https://github.com/ulanpy/nuspace/blob/main/terraform/variables.tf):

```terraform
...
variable "wireguard_subnet_cidr" {
  description = "CIDR for WireGuard clients"
  type        = string
  default     = "10.13.13.0/24"
}
...
```

So ssh using the server's public IP will be blocked by firewall rule without VPN. But even with the VPN on, we can’t ssh into it with its public IP. Why is that?

The destination IP of this TCP packet will be the public IP of the server. It WILL reach the `wg-easy` container through VPN network, and the container will look for the destination IP in its routing table. However, obviously, it won’t find it there and will send the packet to the default gateway, which is the host machine. 

The host machine then does the same, and in its network there is also no such host. Hence, it sends it to its default gateway, which is the internet. BUT, the ssh port 22 is blocked for all but the VPN and IAP IPs, so it gets blocked by the firewall rule. 

This setup proudly named "Our Golden Firewall Rule" by Ulan allows us to secure our server from both angles, without necessarily sacrificing convenience.

---

That's all for the [Nuspace.kz's](https://nuspace.kz) ultimate VPN network. Learn more and contribute at out [GitHub](https://github.com/ulanpy/nuspace). Stay up to date on the Nuspace news at our [Telegram channel](t.me/nuspacechannel). 