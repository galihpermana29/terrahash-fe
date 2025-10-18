import GovLayoutWrapper from "./layout-wrapper";

const LayoutGov = ({ children }: { children: React.ReactNode }) => {
  return (<div>
    <GovLayoutWrapper>
      {children}
    </GovLayoutWrapper>
  </div>);
}

export default LayoutGov;