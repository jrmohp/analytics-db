'use client';

// Chakra imports
import {
  ChakraProvider,
  PortalManager,
  Box,
  useColorModeValue,
} from '@chakra-ui/react';
// Layout components
import Navbar from 'components/navbar/NavbarAdmin';
import Sidebar from 'components/sidebar/Sidebar';
import Footer from 'components/footer/FooterAdmin';
// Contexts
import { SidebarContext } from 'contexts/SidebarContext';
import { ClientDataProvider } from 'contexts/ClientDataContext';
import {FileDataProvider} from 'contexts/FileDataContext';
import routes from 'routes';
import { PropsWithChildren, useEffect, useState } from 'react';

interface DashboardLayoutProps extends PropsWithChildren {
  [x: string]: any;
}

export default function AdminLayout(props: DashboardLayoutProps) {
  const { children, ...rest } = props;

  // Sidebar toggle state
  const [toggleSidebar, setToggleSidebar] = useState(false);

  useEffect(() => {
    window.document.documentElement.dir = 'ltr';
  }, []);

  // Backgrounds from Optum palette
  const layoutBg = 'white';
  const contentBg = 'white';
  const pagePadding = useColorModeValue('30px', '20px');

  return (
      <ChakraProvider>
        <PortalManager>
          <FileDataProvider>
          <ClientDataProvider>
            <Box h="100vh" w="100vw" bg={layoutBg}>
              <SidebarContext.Provider
                  value={{
                    toggleSidebar,
                    setToggleSidebar,
                  }}
              >
                {/* Sidebar */}
                <Sidebar routes={routes} display="none" {...rest} />

                {/* Main content area */}
                <Box
                    float="right"
                    minHeight="100vh"
                    height="100%"
                    overflow="auto"
                    position="relative"
                    maxHeight="100%"
                    w={{ base: '100%', xl: 'calc(100% - 290px)' }}
                    maxWidth={{ base: '100%', xl: 'calc(100% - 290px)' }}
                    transition="all 0.33s cubic-bezier(0.685, 0.0473, 0.346, 1)"
                    transitionDuration=".2s, .2s, .35s"
                    transitionProperty="top, bottom, width"
                    transitionTimingFunction="linear, linear, ease"
                >
                  {/* Navbar */}
                  <Navbar
                      onOpenSidebar={() => setToggleSidebar(true)}
                      activeRoute={rest.router?.pathname}
                  />

                  {/* Page content */}
                  <Box
                      mx="auto"
                      p={{ base: '20px', md: pagePadding }}
                      pe="20px"
                      minH="100vh"
                      pt="50px"
                      bg={contentBg}
                  >
                    {children}
                  </Box>

                  {/* Footer */}
                  <Box>
                    <Footer />
                  </Box>
                </Box>
              </SidebarContext.Provider>
            </Box>
          </ClientDataProvider>
          </FileDataProvider>
        </PortalManager>
      </ChakraProvider>
  );
}

