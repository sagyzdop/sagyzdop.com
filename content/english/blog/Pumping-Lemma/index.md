---
title: "Pumping Lemma"
meta_title: "Pumping Lemma"
description: "Explanation of the Pumping Lemma for Regular Languages and Context-Free Languages with example proofs."
date: 2025-01-30T12:12:12Z
image: "/thumbnail.svg"
categories: ["Computer Science"]
author: "Bakhtiyar Yesbolsyn"
tags: ["Formal languages"]
draft: false
math: true
---

> Refresh the page if the math is not loading correctly.

## Pumping Lemma: for Regular Languages

A formal language that is recognized by a DFA (or NFA, or RegExp) is called a **Regular** language. Some languages would require a DFA with unbounded memory to recognize them, which is not possible. Such languages are **Non-Regular**.

**Pumping Lemma** states that if $L$ is a regular language, then there exists a pumping length $p$ for the language such that for any $w \in L$ where $\lvert w \rvert \ge p$, there is some way we can divide $w$ into parts $x,y,z$ where:

1. $\lvert xy \rvert  \le p$
2. $y\ \text{is not the empty string}$
3. $xy^{i}z \in L, \text{for all}\ i \in \\{0, 1, 2, \dots \\}$

In formal terms we can write this as:

$$
% Original Pumping Lemma
\begin{aligned} 
&\exists p \in \mathbb{N},\ \forall w \in L\ \text{with } \lvert w\rvert  \geq p,\ \exists x,y,z \in \Sigma^\* \\\\ 
&\Bigg( 
\begin{aligned} 
& \lvert xy \rvert  \leq p \\\\ 
& \land\ \lvert y \rvert  > 0 \\\\ 
& \land\ \forall i \geq 0\ (xy^i z \in L) 
\end{aligned} 
\Bigg)
\end{aligned} 
$$

> Lemma guarantees that $xy^{i}z$ is in the language but $x, y, z$ separately are just **arbitrary substrings** of $w$, not necessarily strings in $L$. They are simply strings over the alphabet $\Sigma$, so they belong to $\Sigma^\*$.

The Pumping Lemma says that:

$$
\text{Regular} \implies \text{Pumpable}
$$

and so:

$$
\text{Not Pumpable} \implies \text{Non-Regular}
$$

But this does **NOT** mean if the language is pumpable – it is regular, i.e. it cannot be used to prove that a language is regular. However, pumping lemma is a tool that can be used to prove that a language is non-regular. We can use the negation of the lemma:

$$
% Negation of Pumping Lemma
\begin{aligned} 
&\forall p \in \mathbb{N},\ \exists w \in L\ \text{with } \lvert w\rvert  \geq p,\ \forall x,y,z \in \Sigma^\* \\\\
&\Bigg( 
\begin{aligned} 
& \lvert xy\rvert  \leq p \\\\
& \land\ \lvert y\rvert  > 0 \\\\
& \implies \exists i \geq 0\ (xy^i z \notin L) 
\end{aligned} 
\Bigg)
\end{aligned} 
$$

Which makes proving that a language is non-regular a question of finding a word that is in the language, but is not pumpable.

### Proof Template

1. Suppose $L$ is pumpable with pumping length $p$.
2. Choose an arbitrary $w \in L$ where $\lvert w\rvert  \ge p$.
3. If we divide up $w$ into $xyz$, where $\lvert xy\rvert  \le p$, and $y$ is **nonempty**, then:
	- *(Give facts about the $xy$ and $z$ that you can infer from the language.)*
4. Thus, both when pumping down by removing $y$, and pumping up by repeating $y$ the pumping lemma must still hold.
5. This means that $xy^{i}z$ should also be in $L$, but it cannot be since it *(give a reason specific to the language)*, so $xy^{i} z \notin L$.
6. Therefore, $L$ cannot be pumpable, and thus cannot be regular.

### Example Proof

$$
L = \\{a^{n} b^{n}\\}
$$

1. Suppose $L = \\{a^{n}b^{n}\ \mid\ n \in N\\}$ is pumpable with pumping length $p$.
2. Let $w = a^{p}b^{p}$, which obviously is in $L$.
3. If we divide up $a^{p}b^{p}$ into $xyz$, where $\lvert xy\rvert  \le p$, and $y$ is **nonempty**, then:
	- **$x$ and $y$ only contain $a's$** *(stop and think why is this true, because I figured that this is the most crucial fact in understanding why this works; the hint is in the fact that $\lvert xy\rvert  \le p$)*
	- Since $\lvert y\rvert  \gt 0$, $y = a^{k}\ \text{and}\ \lvert y\rvert  = k$ for some $1 \le k \le p$ *(basically, $k$ is the number of $a's$ in $y$)*
	- $z$ may contain some $a's$, but contains all the $b's$
4. Thus, **pumping down** with $i = 0$:
	- **Remove** $y$ so that $xz = a^{p−k}b^{p}$
	- The number of $a's$ become $p − k$, while $b's$ remain $p$
	- Since $k \ge 1$, $p - k \lt p$
	- Thus $a's \neq b's$, therefore $xz \notin L$
5. And **pumping up** with $i = 2$:
	- **Repeat** $y$ so that $xy^{2}z = a^{p+k}b^{p}$ 
	- The number of $a's$ become $p + k$, while $b's$ remain $p$ *(note that $k$ is used to show that the number of $a's$ become greater than the number of $b's$, and the $2$ in $i = 2$ is arbitrary and doesn't really matter, as long as $i \gt 1$)*
	- Since $k \ge 1$, $p + k \gt p$
	- Thus $a's \neq b's$, therefore $xy^{2}z \notin L$
6. Therefore, $L$ cannot be pumpable, and thus cannot be regular.

#### Pumping down with $y^{0}$ nuance

One thing I was confused about when understanding the proof was the pumping down part.

> Isn't it stated in the lemma that $y$ must be non-empty, so how come we remove the $y$ part and claim that language is non-regular?

The Pumping Lemma requires that **for any valid $w=xyz$ split** $y$ has to be non-empty **only in the original split**. Pumping down ($i=0$) removes $y$, producing $xz$. The lemma guarantees nothing about the new string $xz$ containing $y$; it only requires $xy^{0}z \in L$. So everything checks out. Non-empty $y$ applies only to the word that we choose initially, but pumping down allows us to remove it, and it still has to be in the language.

> Note that pumping lemma has no utility for finite languages, since we can pick $p$ greater than the size of the language which makes the lemma vacuously true. Besides, a finite language is regular by definition, since it is possible to construct a DFA (or NFA, or RegExp) that recognizes all the words in it. And since the lemma can be used to only prove non-regularity of a language it is useless in this case.
 
---

## Pumping Lemma: for Context-Free Languages (CFLs)

A formal language that is recognized by a PDA (Pushdown Automaton) or generated by a CFG (Context-Free Grammar) is called a **Context-Free** language. Some languages would require a PDA with unbounded memory in a way that is not possible, such as simultaneously counting and comparing three or more distinct sections of a string. Such languages are **Non-Context-Free**.

**Pumping Lemma** states that if $L$ is a context-free language, then there exists a pumping length $p$ for the language such that for any $w \in L$ where $\lvert w \rvert \ge p$, there is some way we can divide $w$ into parts $u,v,w,x,y$ where:

1.  $\lvert vwx \rvert \le p$
2.  $vx\ \text{is not the empty string}$
3.  $uv^{i}wx^{i}y \in L, \text{for all}\ i \in \\{0, 1, 2, \dots \\}$

In formal terms we can write this as:

$$
\begin{aligned}
&\exists p \in \mathbb{N},\ \forall w \in L\ \text{with } \lvert w\rvert  \geq p,\ \exists u,v,w,x,y \in \Sigma^\* \\\\
&\Bigg(
\begin{aligned}
& \lvert vwx \rvert  \leq p \\\\
& \land\ \lvert vx \rvert  > 0 \\\\
& \land\ \forall i \geq 0\ (uv^iwx^iy \in L)
\end{aligned}
\Bigg)
\end{aligned}
$$

> Lemma guarantees that $uv^{i}wx^{i}y$ is in the language but $u, v, w, x, y$ separately are just **arbitrary substrings** of $w$, not necessarily strings in $L$. They are simply strings over the alphabet $\Sigma$, so they belong to $\Sigma^\*$.

The Pumping Lemma says that:

$$
\text{Context-Free} \implies \text{Pumpable}
$$

and so:

$$
\text{Not Pumpable} \implies \text{Non-Context-Free}
$$

But this does **NOT** mean if the language is pumpable – it is context-free, i.e. it cannot be used to prove that a language is context-free. However, pumping lemma is a tool that can be used to prove that a language is non-context-free. We can use the negation of the lemma:

$$
\begin{aligned}
&\forall p \in \mathbb{N},\ \exists w \in L\ \text{with } \lvert w\rvert  \geq p,\ \forall u,v,w,x,y \in \Sigma^\* \\\\
&\Bigg(
\begin{aligned}
& \lvert vwx \rvert  \leq p \\\\
& \land\ \lvert vx \rvert  > 0 \\\\
& \implies \exists i \geq 0\ (uv^iwx^iy \notin L)
\end{aligned}
\Bigg)
\end{aligned}
$$

Which makes proving that a language is non-context-free a question of finding a word that is in the language, but is not pumpable.

### Proof Template

1.  Suppose $L$ is pumpable with pumping length $p$.
2.  Choose an arbitrary $w \in L$ where $\lvert w\rvert  \ge p$.
3.  If we divide up $w$ into $uvwxy$, where $\lvert vwx\rvert  \le p$, and $vx$ is **nonempty**, then:
    *   *(Give facts about the $u,v,w,x,y$ that you can infer from the language and the conditions.)*
4.  Thus, both when pumping down by setting $i=0$, and pumping up by repeating $v$ and $x$ the pumping lemma must still hold.
5.  This means that $uv^{i}wx^{i}y$ should also be in $L$, but it cannot be since it *(give a reason specific to the language)*, so $uv^{i}wx^{i}y \notin L$.
6.  Therefore, $L$ cannot be pumpable, and thus cannot be context-free.

### Example Proof

$$
L = \\{a^{n} b^{n} c^{n}\\}
$$

1.  Suppose $L = \\{a^{n}b^{n}c^{n}\ \mid\ n \in \mathbb{N}\\}$ is pumpable with pumping length $p$.
2.  Let $w = a^{p}b^{p}c^{p}$, which is clearly in $L$.
3.  If we divide up $a^{p}b^{p}c^{p}$ into $uvwxy$, where $\lvert vwx\rvert  \le p$, and $\lvert vx\rvert  > 0$, then:
    *   Since $\lvert vwx \rvert \le p$, the segment $vwx$ cannot contain characters from all three distinct blocks ($a$'s, $b$'s, and $c$'s). It must fall entirely within one block of identical characters, or span across at most two adjacent blocks of characters.
    *   Also, since $\lvert vx \rvert > 0$, at least one of $v$ or $x$ must contain at least one character.
4.  Consider pumping down with $i=0$ (or pumping up with $i=2$):
    *   **Case 1: $v$ and $x$ consist of only one type of character.** For example, if $v, x \in a^\*$, or $v,x \in b^\*$, or $v,x \in c^\*$.
        *   If $v=a^k$ and $x=a^m$ where $k+m > 0$. Then $uv^0wx^0y = a^{p-(k+m)}b^pc^p$. Since $k+m > 0$, the count of $a$'s is no longer $p$, while $b$'s and $c$'s remain $p$. Thus, $a^{p-(k+m)}b^pc^p \notin L$. The same logic applies if $v,x \in b^\*$ or $v,x \in c^\*$.
    *   **Case 2: $v$ and $x$ consist of two types of characters.** For example, if $vwx$ spans across the $a$'s and $b$'s (e.g., $v \in a^\*$, $x \in b^\*$, or $v$ contains $a$'s and $b$'s, $x$ is empty, etc.).
        *   If $v$ consists of $a$'s and $x$ consists of $b$'s (or one of them is empty, but combined they affect both $a$'s and $b$'s, e.g., $v = a^k$ and $x = b^m$ with $k+m > 0$). Then $uv^2wx^2y = a^{p+k}b^{p+m}c^p$. Since $k+m > 0$, either the number of $a$'s or $b$'s (or both) changes, while the number of $c$'s remains $p$. This results in an unequal count of characters, so $uv^2wx^2y \notin L$.
        *   A similar argument holds if $vwx$ spans across $b$'s and $c$'s ($v \in b^\*$, $x \in c^\*$, etc.).
5.  In all possible cases, for any valid split $uvwxy$ satisfying the conditions, we can find an $i \ge 0$ (either $i=0$ or $i=2$) such that $uv^iwx^iy \notin L$. This contradicts the Pumping Lemma for CFLs.
6.  Therefore, $L$ cannot be pumpable, and thus cannot be context-free.
