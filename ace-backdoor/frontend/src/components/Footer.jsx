import React from "react";

const Footer = () => {
  return (
    <div className="flex justify-between px-5 mt-[18rem]">
      <p className="font-GilroyBold text-textColor cursor-pointer">
        &copy; {new Date().getFullYear()} AceBackdoor{" "}
      </p>
      <div className="flex gap-5">
        <p className="font-GilroysemiBold  text-secondaryText cursor-pointer">
          Privacy Policy
        </p>
        <p className="font-GilroysemiBold  text-secondaryText cursor-pointer">
          Terms of Use
        </p>
      </div>
    </div>
  );
};

export default Footer;
