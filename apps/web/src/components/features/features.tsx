import React from "react";
import { colors } from "@/lib/design-tokens";
import Header from "../ui/header";
import ExploreFeaturesDashboard from "./explore-features-dashboard";

const patternStyle = {
  height: "100%",
  "--pattern-fg": colors.border.DEFAULT,
  backgroundImage: `repeating-linear-gradient(315deg, ${colors.border.DEFAULT} 0, ${colors.border.DEFAULT} 1px, transparent 0, transparent 50%)`,
  backgroundSize: "10px 10px",
  backgroundAttachment: "fixed",
} as React.CSSProperties;

const Features = () => {
  return (
    <div className="flex flex-col border-b border-border">
      <Header title="Explore Features" />
      <div className="relative min-h-[600px] px-[30px] lg:min-h-[720px] lg:px-[50px]">
        <ExploreFeaturesDashboard />
      </div>
    </div>
  );
};

export default Features;
