import React from "react";
import { DescriptionFieldProps } from "@rjsf/utils";
import { useState, useEffect } from "react";

/** The `DescriptionField` is the template to use to render the description of a field
 *
 * @param props - The `DescriptionFieldProps` for this component
 */
export default function DescriptionField<T = any, F = any>(
  props: DescriptionFieldProps<T, F>,
) {
  const { id, description: initDescription } = props;
  const [description, setDescription] = useState("loading");

  useEffect(() => {
    setDescription(initDescription);
  }, []);

  if (typeof description === "string") {
    return (
      <div id={id} className="field-description">
        <div>{description}</div>
      </div>
    );
  } else {
    return (
      <div id={id} className="field-description">
        <div>{description}</div>
      </div>
    );
  }
}
