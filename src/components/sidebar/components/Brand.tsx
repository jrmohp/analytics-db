// Chakra imports
import { Flex, useColorModeValue } from '@chakra-ui/react';

// Custom components
import { HorizonLogo } from 'components/icons/Icons';
import { HSeparator } from 'components/separator/Separator';

export function SidebarBrand() {
	//   Chakra color mode
	let logoColor = useColorModeValue('navy.100', 'white');

	return (
		<Flex alignItems='center' flexDirection='column'>

		</Flex>
	);
}

export default SidebarBrand;
