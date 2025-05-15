'use client';

import React, { useState } from "react";
import AdminLayout from "layouts/admin";
import {
    Box,
    Flex,
    Heading,
    SimpleGrid,
    Text,
    Select,
    Icon,
    Badge,
    useColorModeValue,
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

const LineChart = dynamic(() => import("components/charts/LineChart"), { ssr: false });
const BarChart = dynamic(() => import("components/charts/BarChart"), { ssr: false });
const PieChart = dynamic(() => import("components/charts/PieChart"), { ssr: false });

const buildDate = new Date().toLocaleDateString();

const clients = [
    {
        name: "Client A",
        id: "1001",
        lob: "Commercial",
        source: 5000,
        facets: 5000,
        billed: {
            daily: [
                { date: "Mon", billed: 1000 },
                { date: "Tue", billed: 1100 },
                { date: "Wed", billed: 1200 },
                { date: "Thu", billed: 1300 },
                { date: "Fri", billed: 1400 },
            ],
            weekly: [
                { date: "Week 1", billed: 4600 },
                { date: "Week 2", billed: 4700 },
                { date: "Week 3", billed: 4800 },
            ],
            monthly: [
                { date: "Jan", billed: 18000 },
                { date: "Feb", billed: 19000 },
                { date: "Mar", billed: 20000 },
            ],
        },
        trend: [
            { date: "Jan", source: 4900, facets: 4800 },
            { date: "Feb", source: 5000, facets: 5000 },
            { date: "Mar", source: 5100, facets: 5000 },
        ],
        unbalanced: 0,
        mismatchBreakdown: [
            { category: "Missing DOB", count: 0 },
            { category: "Invalid LOB", count: 0 },
        ],
    },
    {
        name: "Client B",
        id: "1002",
        lob: "Medicare",
        source: 6200,
        facets: 6100,
        billed: {
            daily: [
                { date: "Mon", billed: 900 },
                { date: "Tue", billed: 1000 },
                { date: "Wed", billed: 1100 },
                { date: "Thu", billed: 1200 },
                { date: "Fri", billed: 1300 },
            ],
            weekly: [
                { date: "Week 1", billed: 4100 },
                { date: "Week 2", billed: 4200 },
            ],
            monthly: [
                { date: "Jan", billed: 15000 },
                { date: "Feb", billed: 16000 },
                { date: "Mar", billed: 17000 },
            ],
        },
        trend: [
            { date: "Jan", source: 6000, facets: 5900 },
            { date: "Feb", source: 6100, facets: 6000 },
            { date: "Mar", source: 6200, facets: 6100 },
        ],
        unbalanced: 100,
        mismatchBreakdown: [
            { category: "Missing DOB", count: 40 },
            { category: "Invalid LOB", count: 60 },
        ],
    },
    {
        name: "Client C",
        id: "1003",
        lob: "Medicaid",
        source: 3100,
        facets: 3000,
        billed: {
            daily: [
                { date: "Mon", billed: 600 },
                { date: "Tue", billed: 650 },
                { date: "Wed", billed: 700 },
                { date: "Thu", billed: 750 },
                { date: "Fri", billed: 800 },
            ],
            weekly: [
                { date: "Week 1", billed: 2500 },
                { date: "Week 2", billed: 2600 },
            ],
            monthly: [
                { date: "Jan", billed: 10000 },
                { date: "Feb", billed: 11000 },
                { date: "Mar", billed: 11500 },
            ],
        },
        trend: [
            { date: "Jan", source: 3000, facets: 2900 },
            { date: "Feb", source: 3100, facets: 3000 },
            { date: "Mar", source: 3200, facets: 3100 },
        ],
        unbalanced: 100,
        mismatchBreakdown: [
            { category: "Missing DOB", count: 30 },
            { category: "Invalid LOB", count: 70 },
        ],
    },
];

const ClientPage: React.FC = () => {
    const [clientIndex, setClientIndex] = useState(0);
    const [trendType, setTrendType] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
    const client = clients[clientIndex];
    const brandColor = useColorModeValue("brand.500", "white");
    const boxBg = useColorModeValue("white", "gray.800");
    const bg = useColorModeValue("secondaryGray.300", "gray.800");
    const isBalanced = client.source === client.facets;
    const diff = client.source - client.facets;

    return (
        <Box pt={{ base: "130px", md: "80px", xl: "80px" }} bg={bg} minH="100vh" px={6}>
            <Heading size="lg" mb={2}>Client Dashboard</Heading>
            <Flex justify="space-between" align="center" mb={4}>
                <Text fontSize="md" color="gray.600">
                    Client ID: {client.id} | LOB: {client.lob} | Build Date: {buildDate}
                </Text>
                <Select
                    w="250px"
                    value={clientIndex}
                    onChange={(e) => setClientIndex(Number(e.target.value))}
                    placeholder="Select Client"
                >
                    {clients.map((c, i) => (
                        <option key={c.id} value={i}>{c.name}</option>
                    ))}
                </Select>
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="20px" my={6}>
                <MiniStatistics startContent={<IconBox w="56px" h="56px" bg={bg} icon={<Icon w="32px" h="32px" as={MdGroup} color={brandColor} />} />} name="Membership Count" value={(client.source + client.facets).toLocaleString()} />
                <MiniStatistics startContent={<IconBox w="56px" h="56px" bg={bg} icon={<Icon w="32px" h="32px" as={MdAssignmentInd} color={brandColor} />} />} name="Source Members" value={client.source.toLocaleString()} />
                <MiniStatistics startContent={<IconBox w="56px" h="56px" bg={bg} icon={<Icon w="32px" h="32px" as={MdInsertChart} color={brandColor} />} />} name="Facets Members" value={client.facets.toLocaleString()} />
                <MiniStatistics startContent={<IconBox w="56px" h="56px" bg={bg} icon={<Icon w="32px" h="32px" as={isBalanced ? MdCheckCircle : MdWarning} color={isBalanced ? 'green.400' : 'red.500'} />} />} name="Balanced" value={isBalanced ? "Yes" : `No (${diff})`} />
            </SimpleGrid>


            <SimpleGrid columns={{ base: 1, md: 2 }} gap={6} mb={6}>
                <Box bg={boxBg} p={6} borderRadius="xl" shadow="md">
                    <Flex justify="space-between" align="center" mb={4}>
                        <Heading size="md">Billed Members Trend ({trendType})</Heading>
                        <Select size="sm" w="150px" value={trendType} onChange={(e) => setTrendType(e.target.value as any)}>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                        </Select>
                    </Flex>
                    <LineChart data={client.billed[trendType]} xKey="date" yKeys={["billed"]} />
                </Box>

                <Box bg={boxBg} p={6} borderRadius="xl" shadow="md">
                    <Heading size="md" mb={4}>Member Count Trend</Heading>
                    <LineChart data={client.trend} xKey="date" yKeys={["source", "facets"]} />
                </Box>

                <Box bg={boxBg} p={6} borderRadius="xl" shadow="md">
                    <Heading size="md" mb={4}>Mismatch Breakdown</Heading>
                    <BarChart data={client.mismatchBreakdown} xKey="category" yKeys={["count"]} />
                </Box>

                <Box bg={boxBg} p={6} borderRadius="xl" shadow="md">
                    <Heading size="md" mb={4}>Balanced vs Unbalanced</Heading>
                    <PieChart data={[{ label: 'Balanced', value: client.facets }, { label: 'Unbalanced', value: client.unbalanced }]} />
                </Box>
            </SimpleGrid>
        </Box>
    );
};

(ClientPage as any).getLayout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;

export default ClientPage;