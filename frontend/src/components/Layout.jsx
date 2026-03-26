import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    return (
        <div style={{ display: 'flex' }}>
            <div className="no-print">
                <Sidebar />
            </div>
            <main className="main-content" style={{
                marginLeft: '250px',
                padding: '2rem',
                width: 'calc(100% - 250px)',
                minHeight: '100vh',
                backgroundColor: 'var(--background)'
            }}>
                {children}
            </main>
        </div>
    );
};

export default Layout;
