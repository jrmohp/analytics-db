'use client';

import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from 'layouts/admin';
import {
    Box,
    Button,
    Flex,
    Heading,
    SimpleGrid,
    Text,
    Select,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    useColorModeValue,
    Badge,
} from '@chakra-ui/react';
import {
    MdGroup,
    MdAssignmentInd,
    MdInsertChart,
    MdTrendingDown,
    MdTrendingUp,
} from 'react-icons/md';
import MiniStatistics from 'components/card/MiniStatistics';
import IconBox from 'components/icons/IconBox';
import dynamic from 'next/dynamic';
import { useClientData } from 'contexts/ClientDataContext';
import { useRouter } from 'next/navigation';

const LineChart = dynamic(() => import('components/charts/LineChart'), { ssr: false });

const MONTHS_12_DESC = [
    'May', 'Apr', 'Mar', 'Feb', 'Jan', 'Dec', 'Nov', 'Oct', 'Sep', 'Aug', 'Jul', 'Jun',
];

const LOBS = ['All LOBs', 'Commercial', 'Medicare', 'Medicaid'];

const METRICS = [
    { key: 'activeMembers', label: 'Active Members' },
    { key: 'billedMembers', label: 'Billed Members' },
    { key: 'balanced', label: 'Balanced' },
    { key: 'termedMembers', label: 'Termed Members' },
    { key: 'selfBilledAmount', label: 'Self Billed Amount' },
    { key: 'facetsBilledAmount', label: 'Facets Billed Amount' },
    { key: 'receivedVsLoaded', label: 'Received vs Loaded' },
    { key: 'receivedVsBilled', label: 'Received vs Billed' },
];

const monthOrder = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const ClientPage: React.FC = () => {
    const { clients, selectedClient, setSelectedClient } = useClientData();
    const router = useRouter();

    const [buildDate, setBuildDate] = useState('');
    const [selectedLob, setSelectedLob] = useState<string>('All LOBs');
    const [selectedMonth, setSelectedMonth] = useState<string>('Mar'); // default March selected

    const isLobSelected = selectedLob !== 'All LOBs';
    const isMonthSelected = selectedMonth !== '';

    // Generate dynamic months list from selectedClient.lobMonthData
    const dynamicMonthsList = useMemo(() => {
        if (!selectedClient) return [];
        const lobMonthData = selectedClient.lobMonthData || {};
        const monthsSet = new Set<string>();
        Object.values(lobMonthData).forEach(monthMap => {
            Object.keys(monthMap).forEach(m => monthsSet.add(m));
        });
        const monthsArray = Array.from(monthsSet);
        monthsArray.sort((a, b) => monthOrder.indexOf(b) - monthOrder.indexOf(a)); // descending
        return monthsArray.length > 0 ? monthsArray : MONTHS_12_DESC;
    }, [selectedClient]);

    const monthsList = isMonthSelected ? [selectedMonth] : MONTHS_12_DESC;

    useEffect(() => {
        setBuildDate(new Date().toLocaleDateString());
    }, []);

    useEffect(() => {
        if (!selectedClient) router.push('/');
    }, [selectedClient, router]);

    useEffect(() => {
        if (isLobSelected && isMonthSelected) {
            setSelectedMonth('');
        }
    }, [isLobSelected, isMonthSelected]);

    if (!selectedClient) return null;

    const brandColor = useColorModeValue('brand.500', 'white');
    const boxBg = useColorModeValue('white', 'gray.800');
    const bg = useColorModeValue('secondaryGray.300', 'gray.800');

    const lobMonthData = selectedClient.lobMonthData || {};
    const lobLast12MonthsAggregate = selectedClient.lobLast12MonthsAggregate || {};

    let tileData = { received: 0, loaded: 0, billed: 0 };

    if (isLobSelected) {
        const agg = lobLast12MonthsAggregate[selectedLob];
        if (agg) {
            tileData = {
                received: agg.received,
                loaded: agg.loaded,
                billed: agg.billed,
            };
        }
    } else if (isMonthSelected) {
        let received = 0,
            loaded = 0,
            billed = 0;
        for (const lob of Object.keys(lobMonthData)) {
            const monthData = lobMonthData[lob]?.[selectedMonth];
            if (monthData) {
                received += monthData.received;
                loaded += monthData.loaded;
                billed += monthData.billed;
            }
        }
        tileData = { received, loaded, billed };
    } else {
        let received = 0,
            loaded = 0,
            billed = 0;
        for (const lob of Object.keys(lobLast12MonthsAggregate)) {
            const agg = lobLast12MonthsAggregate[lob];
            if (agg) {
                received += agg.received;
                loaded += agg.loaded;
                billed += agg.billed;
            }
        }
        tileData = { received, loaded, billed };
    }

    const receivedVsLoadedPercent =
        tileData.loaded === 0
            ? null
            : Math.min(Math.abs(((tileData.received - tileData.loaded) / tileData.loaded) * 100), 100);
    const receivedVsBilledPercent =
        tileData.billed === 0
            ? null
            : Math.min(Math.abs(((tileData.received - tileData.billed) / tileData.billed) * 100), 100);

    const getPercentColor = (percent: number | null) => {
        if (percent === null) return 'gray.500';
        if (percent <= 2) return 'green.400';
        if (percent > 2 && percent <= 5) return 'orange.400';
        return 'red.400';
    };

    const renderBalancedBadge = (val: string) => {
        if (val === 'Yes') return <Badge colorScheme="green" variant="subtle">{val}</Badge>;
        if (val === 'No') return <Badge colorScheme="red" variant="subtle">{val}</Badge>;
        return <Badge colorScheme="gray" variant="subtle">{val}</Badge>;
    };

    const calcReceivedVsLoaded = (received: number, loaded: number) => {
        if (loaded === 0) return 'N/A';
        const diff = received - loaded;
        const perc = Math.min(Math.abs((diff / loaded) * 100), 100).toFixed(1);
        return `${perc}% (${diff >= 0 ? '+' : ''}${diff})`;
    };

    const calcReceivedVsBilled = (received: number, billed: number) => {
        if (billed === 0) return 'N/A';
        const diff = received - billed;
        const perc = Math.min(Math.abs((diff / billed) * 100), 100).toFixed(1);
        return `${perc}% (${diff >= 0 ? '+' : ''}${diff})`;
    };

    const lobsToShow = isLobSelected ? [selectedLob] : Object.keys(lobMonthData).sort();

    type RowData = {
        lob: string;
        month: string;
        values: React.ReactNode[];
    };

    const groupedRows: Record<string, RowData[]> = {};

    for (const month of monthsList) {
        groupedRows[month] = [];
        for (const lob of lobsToShow) {
            if (isLobSelected) {
                if (month !== monthsList[0]) continue;

                const agg = lobLast12MonthsAggregate[lob];
                if (!agg) continue;

                const recVsLoad = calcReceivedVsLoaded(agg.received, agg.loaded);
                const recVsBill = calcReceivedVsBilled(agg.received, agg.billed);

                groupedRows[month].push({
                    lob,
                    month: 'Last 12 Months Consolidated',
                    values: [
                        agg.activeMembers.toLocaleString(),
                        agg.billedMembers.toLocaleString(),
                        agg.balancedCount === agg.monthsCount
                            ? renderBalancedBadge('Yes')
                            : renderBalancedBadge('No'),
                        agg.termedMembers.toLocaleString(),
                        agg.selfBilledAmount.toLocaleString(),
                        agg.facetsBilledAmount.toLocaleString(),
                        <Text color={getPercentColor(parseFloat(recVsLoad))}>{recVsLoad}</Text>,
                        <Text color={getPercentColor(parseFloat(recVsBill))}>{recVsBill}</Text>,
                    ],
                });
            } else {
                const data = lobMonthData[lob]?.[month];
                if (!data) continue;

                const recVsLoad = calcReceivedVsLoaded(data.received, data.loaded);
                const recVsBill = calcReceivedVsBilled(data.received, data.billed);

                groupedRows[month].push({
                    lob,
                    month,
                    values: [
                        data.activeMembers.toLocaleString(),
                        data.billedMembers.toLocaleString(),
                        data.balanced ? renderBalancedBadge('Yes') : renderBalancedBadge('No'),
                        data.termedMembers.toLocaleString(),
                        data.selfBilledAmount.toLocaleString(),
                        data.facetsBilledAmount.toLocaleString(),
                        <Text color={getPercentColor(parseFloat(recVsLoad))}>{recVsLoad}</Text>,
                        <Text color={getPercentColor(parseFloat(recVsBill))}>{recVsBill}</Text>,
                    ],
                });
            }
        }
    }

    const billingTrendData = React.useMemo(() => {
        const months = MONTHS_12_DESC.slice().reverse();

        if (isLobSelected) {
            const lobData = lobMonthData[selectedLob];
            if (!lobData) return [];

            return months.map((m) => ({
                month: m,
                'Facets Billed': lobData[m]?.facetsBilledAmount || 0,
                'Self Billed': lobData[m]?.selfBilledAmount || 0,
            }));
        } else {
            return months.map((m) => {
                let facetsBilled = 0;
                let selfBilled = 0;
                for (const lob of Object.keys(lobMonthData)) {
                    facetsBilled += lobMonthData[lob]?.[m]?.facetsBilledAmount || 0;
                    selfBilled += lobMonthData[lob]?.[m]?.selfBilledAmount || 0;
                }
                return { month: m, 'Facets Billed': facetsBilled, 'Self Billed': selfBilled };
            });
        }
    }, [isLobSelected, selectedLob, lobMonthData]);

    const membershipTrendData = React.useMemo(() => {
        const months = MONTHS_12_DESC.slice().reverse();

        if (isLobSelected) {
            const lobData = lobMonthData[selectedLob];
            if (!lobData) return [];

            return months.map((m) => ({
                month: m,
                Received: lobData[m]?.received || 0,
                Loaded: lobData[m]?.loaded || 0,
            }));
        } else {
            return months.map((m) => {
                let received = 0;
                let loaded = 0;
                for (const lob of Object.keys(lobMonthData)) {
                    received += lobMonthData[lob]?.[m]?.received || 0;
                    loaded += lobMonthData[lob]?.[m]?.loaded || 0;
                }
                return { month: m, Received: received, Loaded: loaded };
            });
        }
    }, [isLobSelected, selectedLob, lobMonthData]);

    return (
        <Box pt={{ base: '130px', md: '80px', xl: '80px' }} bg={bg} minH="100vh" px={6}>
            <Heading size="lg" mb={2} color={brandColor}>
                {selectedClient.name}
            </Heading>

            <Flex justify="space-between" align="center" mb={4} flexWrap="wrap" gap={4}>
                <Text fontSize="md" color="gray.600" flex="1 1 auto">
                    Client ID: {selectedClient.id} | Primary LOB: {selectedClient.lob} | Build Date:{' '}
                    {buildDate || '...'}
                </Text>
                <Select
                    w="200px"
                    value={clients.findIndex((c) => c.id === selectedClient.id)}
                    onChange={(e) => setSelectedClient(clients[Number(e.target.value)])}
                    placeholder="Select Client"
                    flex="0 0 auto"
                >
                    {clients.map((c, i) => (
                        <option key={c.id} value={i}>
                            {c.name}
                        </option>
                    ))}
                </Select>
            </Flex>

            <Flex gap={6} mb={6} flexWrap="wrap" align="center">
                <Box>
                    <Text fontWeight="semibold" mb={1}>
                        Select LOB
                    </Text>
                    <Select
                        value={selectedLob}
                        onChange={(e) => {
                            setSelectedLob(e.target.value);
                            if (e.target.value !== 'All LOBs') setSelectedMonth('');
                        }}
                        w="180px"
                        isDisabled={isMonthSelected}
                        bg="brand.500"
                        color="white"
                        fontWeight="bold"
                        _hover={{ bg: 'brand.600' }}
                        _focus={{ bg: 'brand.600', boxShadow: '0 0 0 2px rgba(237, 137, 54, 0.6)' }}
                    >
                        {LOBS.map((lob) => (
                            <option key={lob} value={lob}>
                                {lob}
                            </option>
                        ))}
                    </Select>
                </Box>

                <Box>
                    <Text fontWeight="semibold" mb={1}>
                        Select Month
                    </Text>
                    <Select
                        value={selectedMonth}
                        onChange={(e) => {
                            setSelectedMonth(e.target.value);
                            if (e.target.value !== '') setSelectedLob('All LOBs');
                        }}
                        w="150px"
                        isDisabled={isLobSelected}
                        bg="brand.500"
                        color="white"
                        fontWeight="bold"
                        _hover={{ bg: 'brand.600' }}
                        _focus={{ bg: 'brand.600', boxShadow: '0 0 0 2px rgba(237, 137, 54, 0.6)' }}
                    >
                        <option value="">-- None --</option>
                        {dynamicMonthsList.map((m) => (
                            <option key={m} value={m}>
                                {m}
                            </option>
                        ))}
                    </Select>
                </Box>

                <Box>
                    <Button
                        onClick={() => {
                            setSelectedLob('All LOBs');
                            setSelectedMonth('');
                        }}
                        colorScheme="blue"
                        mt={6}
                    >
                        Clear Filters
                    </Button>
                </Box>
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 3, lg: 5 }} gap="20px" mb={6}>
                <MiniStatistics
                    startContent={<IconBox icon={<MdGroup color="white" />} bg="brand.500" w="56px" h="56px" />}
                    name="Received Counts"
                    value={tileData.received.toLocaleString()}
                />
                <MiniStatistics
                    startContent={<IconBox icon={<MdAssignmentInd color="white" />} bg="orange.400" w="56px" h="56px" />}
                    name="Loaded Counts"
                    value={tileData.loaded.toLocaleString()}
                />
                <MiniStatistics
                    startContent={<IconBox icon={<MdInsertChart color="white" />} bg="teal.400" w="56px" h="56px" />}
                    name="Billed Count"
                    value={tileData.billed.toLocaleString()}
                />
                <MiniStatistics
                    startContent={
                        <IconBox
                            icon={<MdTrendingDown color="white" />}
                            bg={getPercentColor(receivedVsLoadedPercent)}
                            w="56px"
                            h="56px"
                        />
                    }
                    name="Received vs Loaded"
                    value={
                        receivedVsLoadedPercent === null
                            ? 'N/A'
                            : `${receivedVsLoadedPercent.toFixed(1)}% (${tileData.received - tileData.loaded >= 0 ? '+' : ''}${tileData.received - tileData.loaded
                            })`
                    }
                />
                <MiniStatistics
                    startContent={
                        <IconBox
                            icon={<MdTrendingUp color="white" />}
                            bg={getPercentColor(receivedVsBilledPercent)}
                            w="56px"
                            h="56px"
                        />
                    }
                    name="Received vs Billed"
                    value={
                        receivedVsBilledPercent === null
                            ? 'N/A'
                            : `${receivedVsBilledPercent.toFixed(1)}% (${tileData.received - tileData.billed >= 0 ? '+' : ''}${tileData.received - tileData.billed
                            })`
                    }
                />
            </SimpleGrid>

            {/* Scrollable table */}
            <Box
                bg={boxBg}
                p={6}
                borderRadius="xl"
                shadow="md"
                overflowX="auto"
                overflowY="auto"
                maxHeight="60vh"
                maxWidth="100%"
                mb={4}
            >
                <Table variant="simple" size="md" whiteSpace="nowrap" minW="900px">
                    <Thead bg={useColorModeValue('gray.100', 'gray.700')}>
                        <Tr>
                            <Th>Month</Th>
                            <Th>LOB</Th>
                            {METRICS.map((metric) => (
                                <Th key={metric.key} textAlign="center" whiteSpace="normal">
                                    {metric.label}
                                </Th>
                            ))}
                        </Tr>
                    </Thead>
                    <Tbody>
                        {monthsList.map((month) => (
                            <React.Fragment key={month}>
                                <Tr bg={useColorModeValue('gray.50', 'gray.700')}>
                                    <Td colSpan={METRICS.length + 2} fontWeight="bold" fontSize="lg">
                                        {month}
                                    </Td>
                                </Tr>
                                {groupedRows[month]?.map(({ lob, values }) => (
                                    <Tr key={`${month}-${lob}`}>
                                        <Td>{month}</Td>
                                        <Td>{lob}</Td>
                                        {values.map((val, idx) => (
                                            <Td key={idx} textAlign="center" whiteSpace="normal">
                                                {val}
                                            </Td>
                                        ))}
                                    </Tr>
                                ))}
                            </React.Fragment>
                        ))}
                    </Tbody>
                </Table>
            </Box>

            {/* Graphs row */}
            <SimpleGrid columns={2} gap={6} minH="35vh">
                <Box bg={boxBg} p={6} borderRadius="xl" shadow="md" overflow="hidden">
                    <Heading size="md" mb={2} textAlign="center">
                        Billing Trends
                    </Heading>
                    <Text fontSize="sm" color="gray.500" mb={4} textAlign="center">
                        Facets Billed vs Self Billed Amount (Last 12 Months)
                    </Text>
                    <LineChart
                        data={billingTrendData}
                        xKey="month"
                        yKeys={['Facets Billed', 'Self Billed']}
                        colors={['#3182ce', '#dd6b20']}
                        legendPosition="bottom"
                        showGrid={true}
                        height={280}
                    />
                </Box>

                <Box bg={boxBg} p={6} borderRadius="xl" shadow="md" overflow="hidden">
                    <Heading size="md" mb={2} textAlign="center">
                        Membership Trends
                    </Heading>
                    <Text fontSize="sm" color="gray.500" mb={4} textAlign="center">
                        Received vs Loaded (Last 12 Months)
                    </Text>
                    <LineChart
                        data={membershipTrendData}
                        xKey="month"
                        yKeys={['Received', 'Loaded']}
                        colors={['#2f855a', '#d53f8c']}
                        legendPosition="bottom"
                        showGrid={true}
                        height={280}
                    />
                </Box>
            </SimpleGrid>
        </Box>
    );
};

(ClientPage as any).getLayout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;

export default ClientPage;
