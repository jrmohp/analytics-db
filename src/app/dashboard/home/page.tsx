'use client';

import React, { useState, useMemo } from "react";
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
    useColorModeValue,
} from "@chakra-ui/react";
import {
    MdGroup,
    MdAssignmentInd,
    MdInsertChart,
    MdWarning,
} from "react-icons/md";
import MiniStatistics from "components/card/MiniStatistics";
import IconBox from "components/icons/IconBox";
import { useClientData } from "contexts/ClientDataContext";
import { useRouter } from "next/navigation";

const MONTHS_12_DESC = [
    "Dec",
    "Nov",
    "Oct",
    "Sep",
    "Aug",
    "Jul",
    "Jun",
    "May",
    "Apr",
    "Mar",
    "Feb",
    "Jan",
];

const HomePage: React.FC = () => {
    const { clients, setSelectedClient } = useClientData();
    const router = useRouter();

    const [selectedMonth, setSelectedMonth] = useState<string>("May");

    const brandColor = useColorModeValue("brand.500", "white");
    const boxBg = useColorModeValue("white", "gray.800");
    const bg = useColorModeValue("secondaryGray.300", "gray.800");

    const renderBalancedBadge = (percent: number | null) => {
        if (percent === null) return <Badge colorScheme="gray" variant="subtle">N/A</Badge>;
        if (percent < 2) return <Badge colorScheme="green" variant="subtle">Yes</Badge>;
        if (percent <= 5) return <Badge colorScheme="orange" variant="subtle">Partial</Badge>;
        return <Badge colorScheme="red" variant="subtle">No</Badge>;
    };

    // Compute summary tiles values aggregated for all clients for the selected month
    const tileData = useMemo(() => {
        let received = 0,
            loaded = 0,
            billed = 0,
            totalClients = clients.length,
            unbalancedClients = 0;

        clients.forEach((client) => {
            const lobMonthData = client.lobMonthData || {};
            let receivedSum = 0,
                loadedSum = 0,
                billedSum = 0;

            // If "All Months" selected, aggregate across all months and LOBs
            if (selectedMonth === "All Months") {
                for (const lob of Object.keys(lobMonthData)) {
                    for (const month of Object.keys(lobMonthData[lob])) {
                        const mData = lobMonthData[lob][month];
                        receivedSum += mData.received || 0;
                        loadedSum += mData.loaded || 0;
                        billedSum += mData.billed || 0;
                    }
                }
            } else {
                // Otherwise sum for selected month across all LOBs
                for (const lob of Object.keys(lobMonthData)) {
                    const mData = lobMonthData[lob]?.[selectedMonth];
                    if (mData) {
                        receivedSum += mData.received || 0;
                        loadedSum += mData.loaded || 0;
                        billedSum += mData.billed || 0;
                    }
                }
            }

            received += receivedSum;
            loaded += loadedSum;
            billed += billedSum;

            // Check balanced: less than 2% diff across all lobs/month
            const diffPercent =
                loadedSum === 0
                    ? 100
                    : Math.abs(((receivedSum - loadedSum) / loadedSum) * 100);
            if (diffPercent > 2) {
                unbalancedClients++;
            }
        });

        return {
            received,
            loaded,
            billed,
            totalClients,
            unbalancedClients,
        };
    }, [clients, selectedMonth]);

    // Table data rows filtered by selectedMonth or aggregated if All Months
    const tableData = useMemo(() => {
        // Build array with one entry per client: clientName, received, loaded, billed, received vs loaded, received vs billed, balanced badge
        return clients.map((client) => {
            const lobMonthData = client.lobMonthData || {};
            let receivedSum = 0,
                loadedSum = 0,
                billedSum = 0;

            if (selectedMonth === "All Months") {
                for (const lob of Object.keys(lobMonthData)) {
                    for (const month of Object.keys(lobMonthData[lob])) {
                        const mData = lobMonthData[lob][month];
                        receivedSum += mData.received || 0;
                        loadedSum += mData.loaded || 0;
                        billedSum += mData.billed || 0;
                    }
                }
            } else {
                for (const lob of Object.keys(lobMonthData)) {
                    const mData = lobMonthData[lob]?.[selectedMonth];
                    if (mData) {
                        receivedSum += mData.received || 0;
                        loadedSum += mData.loaded || 0;
                        billedSum += mData.billed || 0;
                    }
                }
            }

            const recVsLoadPercent =
                loadedSum === 0
                    ? null
                    : Math.min(Math.abs(((receivedSum - loadedSum) / loadedSum) * 100), 100);
            const recVsBillPercent =
                billedSum === 0
                    ? null
                    : Math.min(Math.abs(((receivedSum - billedSum) / billedSum) * 100), 100);

            return {
                id: client.id,
                name: client.name,
                received: receivedSum,
                loaded: loadedSum,
                billed: billedSum,
                recVsLoadPercent,
                recVsBillPercent,
            };
        });
    }, [clients, selectedMonth]);

    // Badge color logic
    const getBadgeColor = (percent: number | null) => {
        if (percent === null) return "gray";
        if (percent < 2) return "green";
        if (percent <= 5) return "orange";
        return "red";
    };

    const formatPercentDiff = (percent: number | null, received: number, compared: number) => {
        if (percent === null) return "N/A";
        const diff = received - compared;
        const sign = diff >= 0 ? "+" : "";
        return `${percent.toFixed(1)}% (${sign}${diff.toLocaleString()})`;
    };

    return (
        <Box pt={{ base: "130px", md: "80px", xl: "80px" }} bg={bg} minH="100vh" px={6}>
            <Flex justify="space-between" align="center" mb={4}>
                <Heading size="lg">WHS BH Eligibility Dashboard</Heading>
                <Select
                    w="160px"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    bg="brand.500"
                    color="white"
                    fontWeight="bold"
                    _hover={{ bg: "brand.600" }}
                    _focus={{ bg: "brand.600", boxShadow: "0 0 0 2px rgba(237, 137, 54, 0.6)" }}
                >
                    <option value="All Months">All Months</option>
                    {MONTHS_12_DESC.slice().reverse().map((m) => (
                        <option key={m} value={m}>
                            {m}
                        </option>
                    ))}
                </Select>
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="20px" mb="20px">
                <MiniStatistics
                    startContent={<IconBox w="56px" h="56px" bg={bg} icon={<MdGroup color={brandColor} w="32px" h="32px" />} />}
                    name="Total Members"
                    value={tileData.received.toLocaleString()}
                />
                <MiniStatistics
                    startContent={<IconBox w="56px" h="56px" bg={bg} icon={<MdAssignmentInd color="orange.400" w="32px" h="32px" />} />}
                    name="Members in Facets"
                    value={tileData.loaded.toLocaleString()}
                />
                <MiniStatistics
                    startContent={<IconBox w="56px" h="56px" bg={bg} icon={<MdInsertChart color="teal.400" w="32px" h="32px" />} />}
                    name="Total Clients"
                    value={tileData.totalClients.toString()}
                />
                <MiniStatistics
                    startContent={
                        <IconBox
                            w="56px"
                            h="56px"
                            bg={tileData.unbalancedClients === 0 ? "green.400" : "red.500"}
                            icon={<MdWarning color="white" w="32px" h="32px" />}
                        />
                    }
                    name="Unbalanced Clients"
                    value={tileData.unbalancedClients.toString()}
                />
            </SimpleGrid>

            <Box bg={boxBg} p={6} borderRadius="xl" shadow="md" overflowX="auto" mb={8}>
                <Table variant="simple" size="md" whiteSpace="nowrap" minW="900px">
                    <Thead bg={useColorModeValue("gray.100", "gray.700")}>
                        <Tr>
                            <Th>Client Name</Th>
                            <Th textAlign="right">Received Counts</Th>
                            <Th textAlign="right">Loaded Counts</Th>
                            <Th textAlign="right">Billed Count</Th>
                            <Th textAlign="right">Received vs Loaded</Th>
                            <Th textAlign="right">Received vs Billed</Th>
                            <Th>Balanced</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {tableData.map((row) => (
                            <Tr
                                key={row.id}
                                _hover={{ bg: useColorModeValue("gray.100", "gray.600"), cursor: "pointer" }}
                                onClick={() => {
                                    const client = clients.find(c => c.id === row.id);
                                    if (client) {
                                        setSelectedClient(client);
                                        router.push('client');
                                    }
                                }}
                            >
                                <Td fontWeight="bold" color={brandColor}>
                                    {row.name}
                                </Td>
                                <Td textAlign="right">{row.received.toLocaleString()}</Td>
                                <Td textAlign="right">{row.loaded.toLocaleString()}</Td>
                                <Td textAlign="right">{row.billed.toLocaleString()}</Td>
                                <Td
                                    textAlign="right"
                                    color={getBadgeColor(row.recVsLoadPercent)}
                                    fontWeight="semibold"
                                >
                                    {formatPercentDiff(row.recVsLoadPercent, row.received, row.loaded)}
                                </Td>
                                <Td
                                    textAlign="right"
                                    color={getBadgeColor(row.recVsBillPercent)}
                                    fontWeight="semibold"
                                >
                                    {formatPercentDiff(row.recVsBillPercent, row.received, row.billed)}
                                </Td>
                                <Td>
                                    {renderBalancedBadge(row.recVsLoadPercent)}
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </Box>
        </Box>
    );
};

(HomePage as any).getLayout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;

export default HomePage;
