import React from "react";
import Header from "../ui/header";
import ExploreFeaturesDashboard from "./explore-features-dashboard";

const Features = () => {
  return (
    <div className="flex flex-col border-b border-[#252525]">
      <Header title="Explore Features" />
      <div className="relative min-h-[600px] px-[30px] lg:min-h-[720px] lg:px-[50px]">
        <div
          style={
            {
              height: "100%",
              "--pattern-fg": "#252525",
              borderRight: "1px solid #252525",
              backgroundImage:
                "repeating-linear-gradient(315deg, #252525 0, #252525 1px, transparent 0, transparent 50%)",
              backgroundSize: "10px 10px",
              backgroundAttachment: "fixed",
            } as React.CSSProperties
          }
          className="absolute left-0 top-0 h-full w-[30px] lg:w-[50px]"
        />
        <div
          style={
            {
              height: "100%",
              "--pattern-fg": "#252525",
              borderLeft: "1px solid #252525",
              backgroundImage:
                "repeating-linear-gradient(315deg, #252525 0, #252525 1px, transparent 0, transparent 50%)",
              backgroundSize: "10px 10px",
              backgroundAttachment: "fixed",
            } as React.CSSProperties
          }
          className="absolute right-0 top-0 h-full w-[30px] lg:w-[50px]"
        />
        <ExploreFeaturesDashboard />
      </div>
    </div>
  );
};

export default Features;
