import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }: { children: React.ReactNode }) => (
  <>
    <Header />
    <main className="pt-20">{children}</main> {/* Add pt-20 or adjust as needed */}
    <Footer />
  </>
);

export default Layout;