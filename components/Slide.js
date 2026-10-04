import { ViewTransition } from "react";

// Route-transition wrapper. Links tag navigations with transitionTypes
// (nav-forward / nav-back) and the CSS in globals.css animates them.
export default function Slide({ children }) {
  return (
    <ViewTransition
      enter={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      exit={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      default="none"
    >
      {children}
    </ViewTransition>
  );
}
