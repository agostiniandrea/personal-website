import React from "react";

import { About, AboutProps, FeaturePrimary, FeaturePrimaryProps, HeroPortfolio, HeroPortfolioProps, HeroPrimary, HeroPrimaryProps, Projects, ProjectsProps } from "@components/cms";
import { MODULES } from "@constants";
import { TPageModule } from "@lib/utils/cms";

type DefaultModuleProps = {
  data: TPageModule;
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

/**
 * Cleans the props of a page module by filtering out the "name" field and transforming image data.
 * @param fields - The fields of the page module.
 * @returns The cleaned props object.
 */
type ContentfulAssetFields = {
  fields?: {
    description?: string;
    file?: {
      url?: string;
      contentType?: string;
      details?: {
        image?: {
          height?: number;
          width?: number;
        };
      };
    };
  };
};

export const cleanProps = (fields: TPageModule["fields"]) => {
  const keys = Object.keys(fields).filter((key) => key !== "name");

  const newProps: Record<string, unknown> = {};

  for (const key of keys) {
    const data = fields[key as keyof typeof fields];

    if (typeof data === "string") {
      newProps[key] = data;
    }

    if (Array.isArray(data)) {
      newProps[key] = (data as Array<unknown>).map((item) => {
        if (typeof item === "string") return item;
        if (item !== null && typeof item === "object" && "fields" in item) {
          return cleanProps((item as { fields: TPageModule["fields"] }).fields);
        }
        return item;
      });
    }

    if (data !== null && typeof data === "object" && !Array.isArray(data)) {
      const contentfulData = data as ContentfulAssetFields;
      const nestedFields = contentfulData.fields;

      if (nestedFields?.file?.contentType?.includes("image")) {
        newProps[key] = {
          alt: nestedFields.description,
          height: nestedFields.file.details?.image?.height,
          type: nestedFields.file.contentType,
          url: nestedFields.file.url?.replace("//", "https://"),
          width: nestedFields.file.details?.image?.width,
        } as ImageProps;
      } else if (nestedFields) {
        newProps[key] = nestedFields;
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
    case MODULES.ABOUT:
      return <About {...propsComponent as unknown as AboutProps} />;
    case MODULES.FEATURE_PRIMARY:
      return <FeaturePrimary {...propsComponent as unknown as FeaturePrimaryProps} />;
    case MODULES.HERO_PORTFOLIO:
      return <HeroPortfolio {...propsComponent as unknown as HeroPortfolioProps} />;
    case MODULES.HERO_PRIMARY:
      return <HeroPrimary {...propsComponent as unknown as HeroPrimaryProps} />;
    case MODULES.PROJECTS:
      return <Projects {...propsComponent as unknown as ProjectsProps} />;
    default:
      return <DefaultModule data={data} typename={type} />;
  }
};

type ModuleRendererProps = {
  components: TPageModule[];
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
