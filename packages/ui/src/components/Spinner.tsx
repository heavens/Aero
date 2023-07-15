import { styled, withStyle } from "styletron-react";

const SpinLoader = styled("div", {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 8px"
});

const DEFAULT_SIZE = 64;

/**
 * TODO(mack): Allow passing in more properties like being able to scale the border width alongside the overall width & height.
 */
const SpinnerAnimation = withStyle(SpinLoader, (props: { $width?: number, $height?: number }) => ({
    width: `${props.$width || DEFAULT_SIZE}px`,
    height: `${props.$height || DEFAULT_SIZE}px`,
    border: "3px solid rgba(86, 91, 102, 0.25)",
    borderTopColor: "#777777",
    borderRadius: "50%",
    position: "relative",
    animationDuration: "1s",
    animationIterationCount: "infinite",
    animationTimingFunction: "linear",
    animationName: {
        from: {
            transform: "rotate(0)",
        },
        to: {
            transform: "rotate(1turn)"
        }
    }
}));

type SpinnerProps = {
    width?: number;
    height?: number;
    style?: React.CSSProperties;
};

export default function Spinner(props: SpinnerProps) {
    return (
        <SpinnerAnimation $width={props.width} $height={props.height}/>
    );
}
