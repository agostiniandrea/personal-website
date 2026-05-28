import type { NextPage } from "next";
import type { ErrorProps } from "next/error";
import Error from "next/error";

const CustomErrorComponent: NextPage<ErrorProps> = (props) => {
  return <Error statusCode={props.statusCode} />;
};

CustomErrorComponent.getInitialProps = Error.getInitialProps;

export default CustomErrorComponent;
