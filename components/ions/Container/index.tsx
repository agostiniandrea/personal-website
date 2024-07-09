import styled, { Interpolation } from "styled-components";

interface ContainerProps {
  children: React.ReactNode;
  verticalPadding?: boolean;
  styles?: Interpolation<React.CSSProperties>;
}

const StyledSection = styled.section<ContainerProps>`
  column-gap: calc(24px);
  display: grid;
  grid-template-columns: 1fr min(1440px, 100% - 48px) 1fr;
  min-height: auto;
  ${(props: any) =>
    props.verticalPadding &&
    "padding-top: calc(47px); padding-bottom: calc(47px);"};

  width: 100%;

  @media (min-width: 1536px) {
    grid-template-columns: 1fr min(1440px, 100% - 243px) 1fr;
    column-gap: calc(121.5px);
  }

  @media (min-width: 1200px) {
    grid-template-columns: 1fr min(1440px, 100% - 162px) 1fr;
    column-gap: calc(81px);
    ${(props: any) =>
      props.verticalPadding &&
      "padding-top: calc(54px); padding-bottom: calc(54px);"};
  }

  @media (min-width: 900px) {
    grid-template-columns: 1fr min(1440px, 100% - 72px) 1fr;
    column-gap: calc(36px);
  }

  @media (min-width: 600px) {
    grid-template-columns: 1fr min(1440px, 100% - 48px) 1fr;
    column-gap: calc(24px);
  }

  > * {
    grid-column: 2 / auto;
  }

  ${({ styles }) => styles}
`;

const Container: React.FC<ContainerProps> = (props) => (
  <StyledSection {...props} />
);

export default Container;
