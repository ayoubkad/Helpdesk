import Navbar from "./Navbar";
import Sidebar from"./Sidebar" ;
import "./Layout.css";
function Layout ({children}){
    return(
        <>
        <Navbar/>
        <div className="container">
        <Sidebar/>
        <main>
            {children}
        </main>
        </div>
        </>
    );
}
export default Layout;