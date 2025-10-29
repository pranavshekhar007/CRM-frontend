import React from "react";
import { BsPencil, BsTrash, BsEye } from "react-icons/bs";

const ActionButtons = ({ canView, canUpdate, canDelete, onView, onEdit, onDelete }) => {
  return (
    <div className="text-center pe-4">
      {canView && (
        <BsEye
          size={18}
          className="mx-2 text-primary"
          style={{ cursor: "pointer" }}
          onClick={onView}
        />
      )}
      {canUpdate && (
        <BsPencil
          size={18}
          className="mx-2 text-warning"
          style={{ cursor: "pointer" }}
          onClick={onEdit}
        />
      )}
      {canDelete && (
        <BsTrash
          size={18}
          className="mx-2 text-danger"
          style={{ cursor: "pointer" }}
          onClick={onDelete}
        />
      )}
    </div>
  );
};

export default ActionButtons;
