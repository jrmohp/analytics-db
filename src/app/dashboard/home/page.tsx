// full code with trend toggles and dynamic chart rendering, updated to respect LOB selection for line chart
'use client';

import React, { useState } from "react";
import AdminLayout from "layouts/admin";
import {
    Box,
    Flex,
    Heading,
    SimpleGrid,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Select,
    Badge,
    Tooltip,
    Icon,
    useColorModeValue,
    Text,
} from "@chakra-ui/react";
import {
    MdGroup,
    MdAssignmentInd,
    MdInsertChart,
    MdWarning,
    MdCheckCircle,
} from "react-icons/md";
import MiniStatistics from "components/card/MiniStatistics";
import IconBox from "components/icons/IconBox";
import dynamic from "next/dynamic";

const BarChart = dynamic(() => import("components/charts/BarChart"), { ssr: false });
const LineChart = dynamic(() => import("components/charts/LineChart"), { ssr: false });

interface BarChartDataItem {
    client: string;
    source: number;
    facets: number;
    lob: string;
}

const barChartData: BarChartDataItem[] = [
    { client: "Client A", source: 5000, facets: 5000, lob: "Commercial" },
    { client: "Client B", source: 6200, facets: 6200, lob: "Commercial" },
    { client: "Client C", source: 3100, facets: 3100, lob: "Commercial" },
    { client: "Client D", source: 7000, facets: 6900, lob: "Medicare" },
    { client: "Client E", source: 4200, facets: 4100, lob: "Medicare" },
    { client: "Client F", source: 2000, facets: 1900, lob: "Medicare" },
    { client: "Client G", source: 3500, facets: 3450, lob: "Medicaid" },
    { client: "Client H", source: 4300, facets: 4300, lob: "Medicaid" },
    { client: "Client I", source: 2700, facets: 2650, lob: "Medicaid" },
    { client: "Client J", source: 1800, facets: 1700, lob: "Exchange" },
    { client: "Client K", source: 5100, facets: 4900, lob: "Exchange" },
    { client: "Client L", source: 4900, facets: 4850, lob: "Exchange" },
];

const billingTrends = {
    weekly: [
        { date: "Week 1", Commercial: 15000, Medicare: 13000, Medicaid: 12500, Exchange: 9000 },
        { date: "Week 2", Commercial: 15200, Medicare: 13500, Medicaid: 12800, Exchange: 9100 },
        { date: "Week 3", Commercial: 15350, Medicare: 14000, Medicaid: 13050, Exchange: 9200 },
        { date: "Week 4", Commercial: 15500, Medicare: 14200, Medicaid: 13100, Exchange: 9250 },
    ],
    monthly: [
        { date: "Jan", Commercial: 60000, Medicare: 54000, Medicaid: 50000, Exchange: 36000 },
        { date: "Feb", Commercial: 62000, Medicare: 55000, Medicaid: 52000, Exchange: 37000 },
        { date: "Mar", Commercial: 64000, Medicare: 56000, Medicaid: 53000, Exchange: 38000 },
    ],
    daily: [
        { date: "Mon", Commercial: 4800, Medicare: 4100, Medicaid: 4000, Exchange: 2900 },
        { date: "Tue", Commercial: 4900, Medicare: 4200, Medicaid: 4100, Exchange: 3000 },
        { date: "Wed", Commercial: 5100, Medicare: 4300, Medicaid: 4200, Exchange: 3100 },
        { date: "Thu", Commercial: 5200, Medicare: 4400, Medicaid: 4300, Exchange: 3200 },
        { date: "Fri", Commercial: 5300, Medicare: 4500, Medicaid: 4400, Exchange: 3300 },
    ],
};

const HomePage: React.FC = () => {
    const [selectedLob, setSelectedLob] = useState<string | undefined>(undefined);
    const [trendType, setTrendType] = useState<'weekly' | 'monthly' | 'daily'>('weekly');

    const brandColor = useColorModeValue('brand.500', 'white');
    const boxBg = useColorModeValue('white', 'white');
    const bg = useColorModeValue('secondaryGray.300', 'gray.800');
    const buildDateTime = new Date().toLocaleString();

    const filteredData = selectedLob
        ? barChartData.filter((item) => item.lob === selectedLob)
        : barChartData;

    const totalSource = filteredData.reduce((sum, item) => sum + item.source, 0);
    const totalFacets = filteredData.reduce((sum, item) => sum + item.facets, 0);
    const unbalancedCount = filteredData.filter((item) => item.source !== item.facets).length;

    const topClients = selectedLob
        ? [...filteredData].sort((a, b) => b.source - a.source).slice(0, 5)
        : [];

    const overallByLob = Object.entries(
        barChartData.reduce<Record<string, { source: number; facets: number }>>(
            (acc, item) => {
                if (!acc[item.lob]) acc[item.lob] = { source: 0, facets: 0 };
                acc[item.lob].source += item.source;
                acc[item.lob].facets += item.facets;
                return acc;
            },
            {}
        )
    ).map(([lob, values]) => ({ lob, ...values }));

    const trendData = billingTrends[trendType];
    const lobKeys = selectedLob ? [selectedLob] : ["Commercial", "Medicare", "Medicaid", "Exchange"];

    return (
        <Box pt={{ base: '130px', md: '80px', xl: '80px' }} bg={bg} minH="100vh">
            <Flex justify="space-between" align="center" mb={6} px={6}>
                <Box>
                    <Heading size="lg">WHS BH Eligibility Dashboard</Heading>
                    <Text fontSize="sm" color="gray.500">Build Date: {buildDateTime}</Text>
                </Box>
                <Flex gap={4} align="center">
                    <Select
                        placeholder="All LOB"
                        size="md"
                        w="220px"
                        fontWeight="bold"
                        bg="white"
                        borderColor="gray.300"
                        boxShadow="sm"
                        value={selectedLob || ''}
                        onChange={(e) => setSelectedLob(e.target.value || undefined)}
                        _hover={{ borderColor: 'gray.400' }}
                        _focus={{ borderColor: 'orange.400', boxShadow: '0 0 0 1px orange' }}
                    >
                        {[...new Set(barChartData.map((d) => d.lob))].map((lob) => (
                            <option key={lob} value={lob}>{lob}</option>
                        ))}
                    </Select>
                </Flex>
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="20px" px={6} mb="20px">
                <MiniStatistics startContent={<IconBox w="56px" h="56px" bg={bg} icon={<Icon w="32px" h="32px" as={MdGroup} color={brandColor} />} />} name="Total Member Count" value={totalSource.toLocaleString()} />
                <MiniStatistics startContent={<IconBox w="56px" h="56px" bg={bg} icon={<Icon w="32px" h="32px" as={MdAssignmentInd} color={brandColor} />} />} name="Facets Count" value={totalFacets.toLocaleString()} />
                <MiniStatistics startContent={<IconBox w="56px" h="56px" bg={bg} icon={<Icon w="32px" h="32px" as={MdInsertChart} color={brandColor} />} />} name="Total Clients" value={filteredData.length.toString()} />
                <MiniStatistics startContent={<IconBox w="56px" h="56px" bg={bg} icon={<Icon w="32px" h="32px" as={unbalancedCount === 0 ? MdCheckCircle : MdWarning} color={unbalancedCount === 0 ? 'green.400' : 'red.500'} />} />} name="Unbalanced Clients" value={unbalancedCount.toString()} />
            </SimpleGrid>



            <SimpleGrid columns={1} gap="20px" px={6} mb="20px">
                <Box bg={boxBg} p={6} borderRadius="xl" shadow="md">
                    <Heading size="md" mb={4}>{selectedLob ? `Top 5 Clients in ${selectedLob}` : "LOB Summary Chart"}</Heading>
                    <BarChart
                        data={selectedLob ? topClients : overallByLob}
                        xKey={selectedLob ? "client" : "lob"}
                        yKeys={["source", "facets"]}
                    />
                </Box>
            </SimpleGrid>

            <SimpleGrid columns={1} gap="20px" px={6} mb="20px">
                <Box bg={boxBg} p={6} borderRadius="xl" shadow="md">
                    <Flex justify="space-between" align="center" mb={4}>
                        <Heading size="md">LOB Billing Trend</Heading>
                        <Select size="sm" w="150px" value={trendType} onChange={(e) => setTrendType(e.target.value as any)}>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                        </Select>
                    </Flex>
                    <LineChart
                        data={trendData}
                        xKey="date"
                        yKeys={lobKeys}
                    />
                </Box>
            </SimpleGrid>
            {selectedLob && (
                <SimpleGrid columns={1} gap="20px" px={6} mb="20px">
                    <Box bg={boxBg} p={6} borderRadius="xl" shadow="md">
                        <Heading size="md" mb={4}>Detailed LOB Analysis</Heading>
                        <Table variant="simple">
                            <Thead>
                                <Tr>
                                    <Th>Client</Th>
                                    <Th>LOB</Th>
                                    <Th>Source</Th>
                                    <Th>Facets</Th>
                                    <Th>Status</Th>
                                    <Th>Diff</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {filteredData.map((item) => (
                                    <Tr key={item.client}>
                                        <Td>{item.client}</Td>
                                        <Td>{item.lob}</Td>
                                        <Td>{item.source}</Td>
                                        <Td>{item.facets}</Td>
                                        <Td>
                                            {item.source === item.facets ? (
                                                <Badge colorScheme="green">Balanced</Badge>
                                            ) : (
                                                <Badge colorScheme="red">Mismatch</Badge>
                                            )}
                                        </Td>
                                        <Td>{item.source - item.facets}</Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </Box>
                </SimpleGrid>
            )}
        </Box>
    );
};

(HomePage as any).getLayout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;

export default HomePage;