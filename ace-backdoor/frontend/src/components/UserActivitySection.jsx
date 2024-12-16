// src/components/UserActivitySection.jsx
import React, { useState } from "react";
import ConditionFilter from "./ConditionFilter";
import UserActivityTable from "./UserActivityTable";

const UserActivitySection = () => {
  const [selectedFlags, setSelectedFlags] = useState([]);
  const [percentage, setPercentage] = useState(100); // Default to 100%

  return (
    <div>
      <ConditionFilter
        selectedFlags={selectedFlags}
        setSelectedFlags={setSelectedFlags}
        percentage={percentage}
        setPercentage={setPercentage}
      />
      <UserActivityTable
        selectedFlags={selectedFlags}
        percentage={percentage}
      />
    </div>
  );
};

export default UserActivitySection;
