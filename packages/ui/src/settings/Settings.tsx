import React from "react";
import { styled } from "styletron-react";
import { Ctx, Theme } from "../Theme";

const Backdrop = styled("div", {
  display: "block",
  position: "absolute",
  top: "31px",
  left: "0",
  width: "100vw",
  height: 90 + `vh`,
  background: "rgba(0, 0, 0, 0.4)",
  backdropFilter: "blur(5px)",
  opacity: 1
});

const Root = styled("div", (props: { $theme: Theme }) =>  ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  alignSelf: "center",
  position: "absolute",
  flexDirection: "column",
  width: "600px",
  background: props.$theme.colors.app.bg
}));

const Section = styled("div", (props: { $theme?: Theme }) => ({
  padding: "16px",
  borderTop: `1px solid ${props.$theme.colors.app.border}`,
  
  "&:first-child": {
    padding: "16px"
  },
  "&:last-child": {
    padding: "16px"
  }
}));

const SectionContainer = styled("div", (props: { $theme?: Theme }) => ({
  width: "100%",
  maxWidth: "800px",
  background: props.$theme.colors.app.bg,
  border: `1px solid ${props.$theme.colors.app.border}`,
}));

type SettingsProps = {

}

type SettingsState = {

}

export class Settings extends React.Component<
  SettingsProps,
  SettingsState
> {

  render() {
    const theme = this.context as Theme;
    return <Backdrop>
      <Root $theme={theme}>
        <SectionContainer $theme={theme}>
          <Section $theme={theme}></Section>
          <Section $theme={theme}></Section>
        </SectionContainer>
      </Root>
    </Backdrop>
  }
}

Settings.contextType = Ctx;