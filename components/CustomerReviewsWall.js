"use client";

import Image from "next/image";
import Link from "next/link";
 

export default function CustomerReviewsWall() {
  return (
    <section className="reviews-wall" aria-labelledby="reviews-wall-title">
      <div className="reviews-wall-sticky">
        <div className="reviews-wall-heading">
          <p className="eyebrow">Customer proof / 02</p>
          <h2 id="reviews-wall-title">Client feedback</h2>
          <p>Real messages, delivery updates and marketplace reviews from customers who received the product.</p>
        </div>

        <div className="reviews-wall-window">
          <div className="reviews-wall-track">
            <Image
              src="/customer-reviews.avif"
              alt="Customer feedback and reviews for SYBOC INDUSTRIES products"
              width={2735}
              height={538}
              sizes="auto"
              priority={false}
            />
            <Image
              src="/customer-reviews.avif"
              alt=""
              width={2735}
              height={538}
              sizes="auto"
              aria-hidden="true"
            />
          </div>
        </div>

        <div className="reviews-wall-footer">
          <span>SCROLL TO EXPLORE</span>
          <span className="reviews-wall-line" aria-hidden="true" />
          <Link href="/contact" transitionTypes={["nav-forward"]}>Talk to the trade desk ↗</Link>
        </div>
      </div>
    </section>
  );
}
