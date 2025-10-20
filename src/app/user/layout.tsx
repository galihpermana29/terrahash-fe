import UserLayoutWrapper from "./layout-wrapper";

const LayoutUser = ({ children }: { children: React.ReactNode }) => {
  return (<div>
    <UserLayoutWrapper>
      {children}
    </UserLayoutWrapper>
  </div>);
}

export default LayoutUser;