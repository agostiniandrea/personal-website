import styled from "styled-components";

import { Text } from "@components/ions";

/* Shared eyebrow label used above every section heading */
const SectionLabel = styled(Text)`
  color: ${({ theme }) => theme.colors.highlight};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  letter-spacing: 0.2em;
  margin: 0 0 1.25rem;
  text-transform: uppercase;
`;

export default SectionLabel;
