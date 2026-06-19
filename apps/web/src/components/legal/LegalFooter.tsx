import React from "react";

export function LegalFooter() {
  return (
    <div className="mt-16 pt-8 border-t border-light text-center text-text-light">
      <p className="text-sm">
        © {new Date().getFullYear()} Opensox Labs. All rights reserved.
      </p>
    </div>
  );
}
