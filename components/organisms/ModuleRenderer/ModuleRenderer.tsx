import React from "react";

import { HeroPrimary } from "@components/cms";
import { MODULES } from "@constants";
import { TPageModule } from "@lib/utils/cms/getPageContent";

type DefaultModuleProps = {
  data: any;
  typename: string;
};

const DefaultModule: React.FC<DefaultModuleProps> = ({
  data = {},
  typename = "",
}) => {
  return (
    <div>
      {typename ? (
        <>
          <h3>
            Component Missing:
            {typename}
          </h3>
          <code>
            <pre>{JSON.stringify(data)} </pre>
          </code>
        </>
      ) : (
        <>
          <h2>Component Missing</h2>
        </>
      )}
    </div>
  );
};

export const cleanProps = (fields: TPageModule["fields"]) => {
  const keys = Object.keys(fields).filter((key) => key !== "name");

  const newProps: any = {};

  for (const key of keys) {
    const data = fields[key as any];

    if (typeof data === "string") {
      newProps[key] = data;
    }

    if (typeof data === "object") {
      const { fields } = data;

      const isImage = fields.file?.contentType?.includes("image");

      if (isImage) {
        newProps[key] = {
          alt: fields.description,
          height: fields.file.details.image.height,
          type: fields.file.contentType,
          url: fields.file.url.replace("//", "https://"),
          width: fields.file.details.image.width,
        } as ImageProps;
      } else {
        newProps[key] = fields;
      }
    }
  }

  return newProps;
};

type ModuleMatrixProps = {
  data: TPageModule;
  pageOrigin: string;
};

const ModuleMatrix: React.FC<ModuleMatrixProps> = ({ data }) => {
  const { type, fields } = data;

  const propsComponent = cleanProps(fields);

  switch (type) {
    case MODULES.HERO_PRIMARY:
      return <HeroPrimary {...propsComponent} />;
    default:
      return <DefaultModule data={data} typename={type} />;
  }
};

type ModuleRendererProps = {
  components: any[];
  pageOrigin?: string;
};

const ModuleRenderer: React.FC<ModuleRendererProps> = ({
  components = [],
  pageOrigin = "",
  ...rest
}) => (
  <>
    {components.map((componentData, index) => (
      <React.Fragment key={`${componentData.id}-${index.toString()}`}>
        {componentData && (
          <ModuleMatrix
            data={componentData}
            pageOrigin={pageOrigin}
            {...rest}
          />
        )}
      </React.Fragment>
    ))}
  </>
);

export default ModuleRenderer;
