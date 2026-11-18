type SpinnerProps = {
    style?: React.CSSProperties;
};

export default (props: SpinnerProps) => {
    return (<div className="spin-loader spinner" style={{ ...props.style }} />);
}
