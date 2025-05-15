/* eslint-disable */

import { Box, Flex, HStack, Text, useColorModeValue } from '@chakra-ui/react';
import Link from 'next/link';
import { IRoute } from 'types/navigation';
import { usePathname } from 'next/navigation';
import { useCallback } from 'react';

interface SidebarLinksProps {
  routes: IRoute[];
}

export function SidebarLinks(props: SidebarLinksProps) {
  const { routes } = props;

  const pathname = usePathname();

  // Optum theme colors
  const activeColor = useColorModeValue('gray.700', 'white');
  const inactiveColor = useColorModeValue('secondaryGray.600', 'secondaryGray.600');
  const activeIcon = useColorModeValue('brand.500', 'white');
  const textColor = useColorModeValue('secondaryGray.500', 'white');
  const brandColor = useColorModeValue('brand.500', 'brand.400');

  // Only match route if path equals or starts with the full route
  const activeRoute = useCallback(
      (routeFullPath: string) => {
        return pathname === routeFullPath || pathname?.startsWith(routeFullPath + '/');
      },
      [pathname]
  );

  const createLinks = (routes: IRoute[]) => {
    return routes.map((route, index: number) => {
      if (
          route.layout === '/dashboard'
      ) {
        const fullPath = (route.layout + route.path).toLowerCase();
        const isActive = activeRoute(fullPath);

        return (
            <Link key={index} href={fullPath}>
              {route.icon ? (
                  <Box>
                    <HStack spacing={isActive ? '22px' : '26px'} py="5px" ps="10px">
                      <Flex w="100%" alignItems="center" justifyContent="center">
                        <Box color={isActive ? activeIcon : textColor} me="18px">
                          {route.icon}
                        </Box>
                        <Text
                            me="auto"
                            color={isActive ? activeColor : textColor}
                            fontWeight={isActive ? 'bold' : 'normal'}
                        >
                          {route.name}
                        </Text>
                      </Flex>
                      <Box
                          h="36px"
                          w="4px"
                          bg={isActive ? brandColor : 'transparent'}
                          borderRadius="5px"
                      />
                    </HStack>
                  </Box>
              ) : (
                  <Box>
                    <HStack spacing={isActive ? '22px' : '26px'} py="5px" ps="10px">
                      <Text
                          me="auto"
                          color={isActive ? activeColor : inactiveColor}
                          fontWeight={isActive ? 'bold' : 'normal'}
                      >
                        {route.name}
                      </Text>
                      <Box h="36px" w="4px" bg={isActive ? brandColor : 'transparent'} borderRadius="5px" />
                    </HStack>
                  </Box>
              )}
            </Link>
        );
      }

      return null;
    });
  };

  return <>{createLinks(routes)}</>;
}

export default SidebarLinks;
