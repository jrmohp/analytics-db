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
    'May','Apr','Mar','Feb','Jan','Dec','Nov','Oct','Sep','Aug','Jul','Jun',
];

const LOBS = ['All LOBs','Commercial','Medicare','Medicaid'];

const ClientPage: React.FC = () => {
    const { clients, selectedClient, setSelectedClient } = useClientData();
    const router = useRouter();

    const [buildDate, setBuildDate] = useState('');
    const [selectedLob, setSelectedLob] = useState<string>('All LOBs');
    const [selectedMonth, setSelectedMonth] = useState<string>('');

    // redirect if no client
    useEffect(() => {
        if (!selectedClient) router.push('/');
    }, [selectedClient, router]);

    // set build date once
    useEffect(() => {
        setBuildDate(new Date().toLocaleDateString());
    }, []);

    if (!selectedClient) return null;

    const bg = useColorModeValue('secondaryGray.300','gray.800');
    const cardBg = useColorModeValue('white','gray.800');
    const brandColor = useColorModeValue('brand.500','white');

    // Extract the per-lob per-month maps
    const lobMonthData = selectedClient.lobMonthData || {};
    const lobLast12MonthsAggregate = selectedClient.lobLast12MonthsAggregate || {};

    // Decide our current tiles: Received / Loaded / Billed
    let tileData = { received:0, loaded:0, billed:0 };
    const isLob = selectedLob!=='All LOBs';
    const isMonth = selectedMonth!=='';
    if (isLob) {
        const agg = lobLast12MonthsAggregate[selectedLob];
        if (agg) tileData = { received:agg.received, loaded:agg.loaded, billed:agg.billed };
    } else if (isMonth) {
        let r=0,l=0,b=0;
        Object.keys(lobMonthData).forEach(lob=>{
            const m=lobMonthData[lob]?.[selectedMonth];
            if(m){ r+=m.received; l+=m.loaded; b+=m.billed; }
        });
        tileData = {received:r,loaded:l,billed:b};
    } else {
        let r=0,l=0,b=0;
        Object.values(lobLast12MonthsAggregate).forEach(agg=>{
            r+=agg.received; l+=agg.loaded; b+=agg.billed;
        });
        tileData={received:r,loaded:l,billed:b};
    }

    // Percent helpers
    const calcDiff = (tot:number, part:number) =>
        tot===0?'N/A':`${((tot - part)/part*100).toFixed(1)}% (${tot-part>=0?'+':''}${tot-part})`;

    // Build months list and LOBs list
    const months = useMemo(()=>{
        return isMonth
            ? [selectedMonth]
            : MONTHS_12_DESC;
    },[isMonth,selectedMonth]);

    const lobsList = isLob
        ? [selectedLob]
        : Object.keys(lobMonthData).sort();

    // Build rows: for each month, for each lob
    type Row = { month:string; lob:string; received:number; loaded:number; billed:number; balanced:boolean; recVsLoad:string; recVsBill:string };
    const rowsByMonth: Record<string,Row[]> = {};
    months.forEach(month=>{
        rowsByMonth[month]=[];
        lobsList.forEach(lob=>{
            if(isLob){
                // consolidated agg
                const agg = lobLast12MonthsAggregate[lob];
                if(!agg) return;
                rowsByMonth[month].push({
                    month:'Last 12 Mo', lob,
                    received:agg.received,
                    loaded:agg.loaded,
                    billed:agg.billed,
                    balanced: agg.loaded===agg.received,
                    recVsLoad: calcDiff(agg.received,agg.loaded),
                    recVsBill: calcDiff(agg.received,agg.billed),
                });
            } else {
                const m=lobMonthData[lob]?.[month];
                if(!m) return;
                rowsByMonth[month].push({
                    month, lob,
                    received:m.received,
                    loaded:m.loaded,
                    billed:m.billed,
                    balanced: m.loaded===m.received,
                    recVsLoad: calcDiff(m.received,m.loaded),
                    recVsBill: calcDiff(m.received,m.billed),
                });
            }
        });
    });

    return (
        <Box pt={{ base:'130px', md:'80px', xl:'80px' }} px={6} bg={bg} minH="100vh">
            {/* Header */}
            <Heading size="lg" mb={2} color={brandColor}>{selectedClient.name}</Heading>
            <Flex justify="space-between" align="center" mb={4} flexWrap="wrap" gap={4}>
                <Text color="gray.600">
                    ID: {selectedClient.id} • LOB: {selectedClient.lob} • Built: {buildDate}
                </Text>
                <Select w="200px" value={clients.findIndex(c=>c.id===selectedClient.id)} onChange={e=>setSelectedClient(clients[Number(e.target.value)])}>
                    {clients.map((c,i)=><option key={c.id} value={i}>{c.name}</option>)}
                </Select>
            </Flex>

            {/* Filters */}
            <Flex gap={6} mb={6} flexWrap="wrap" align="center">
                <Box>
                    <Text mb={1} fontWeight="semibold">Select LOB</Text>
                    <Select
                        value={selectedLob}
                        onChange={e=>{ setSelectedLob(e.target.value); setSelectedMonth(''); }}
                        w="180px"
                        bg="brand.500" color="white"
                        _hover={{ bg:'brand.600' }}
                        _focus={{ bg:'brand.600' }}
                    >
                        {LOBS.map(l=> <option key={l}>{l}</option> )}
                    </Select>
                </Box>
                <Box>
                    <Text mb={1} fontWeight="semibold">Select Month</Text>
                    <Select
                        value={selectedMonth}
                        onChange={e=>{ setSelectedMonth(e.target.value); setSelectedLob('All LOBs'); }}
                        w="150px"
                        bg="brand.500" color="white"
                        _hover={{ bg:'brand.600' }}
                        _focus={{ bg:'brand.600' }}
                    >
                        <option value="">-- None --</option>
                        {Array.from(new Set(Object.values(lobMonthData).flatMap(m=>Object.keys(m)))).sort().map(m=>(
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </Select>
                </Box>
                <Button mt={6} onClick={()=>{ setSelectedLob('All LOBs'); setSelectedMonth(''); }} colorScheme="blue">
                    Clear
                </Button>
            </Flex>

            {/* Tiles */}
            <SimpleGrid columns={{ base:1, md:3, lg:5 }} gap={4} mb={6}>
                <MiniStatistics
                    name="Received Count"
                    value={tileData.received.toLocaleString()}
                    startContent={<IconBox icon={<MdGroup color="white"/>} bg="brand.500" w="56px" h="56px"/>}
                />
                <MiniStatistics
                    name="Loaded Count"
                    value={tileData.loaded.toLocaleString()}
                    startContent={<IconBox icon={<MdAssignmentInd color="white"/>} bg="orange.400" w="56px" h="56px"/>}
                />
                <MiniStatistics
                    name="Billed Count"
                    value={tileData.billed.toLocaleString()}
                    startContent={<IconBox icon={<MdInsertChart color="white"/>} bg="teal.400" w="56px" h="56px"/>}
                />
                <MiniStatistics
                    name="Received vs Loaded"
                    value={calcDiff(tileData.received,tileData.loaded)}
                    startContent={<IconBox icon={<MdTrendingDown color="white"/>} bg="red.400" w="56px" h="56px"/>}
                />
                <MiniStatistics
                    name="Received vs Billed"
                    value={calcDiff(tileData.received,tileData.billed)}
                    startContent={<IconBox icon={<MdTrendingUp color="white"/>} bg="green.400" w="56px" h="56px"/>}
                />
            </SimpleGrid>

            {/* Table */}
            <Box bg={cardBg} p={6} borderRadius="xl" shadow="md" overflowX="auto" mb={6}>
                <Table variant="simple" minW="800px">
                    <Thead bg={useColorModeValue('gray.100','gray.700')}>
                        <Tr>
                            <Th>Month</Th>
                            <Th>LOB</Th>
                            <Th isNumeric>Received</Th>
                            <Th isNumeric>Loaded</Th>
                            <Th>Balanced?</Th>
                            <Th>Unbal %</Th>
                            <Th>Unbal Count</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {months.map(month=>(
                            <React.Fragment key={month}>
                                <Tr bg={useColorModeValue('gray.50','gray.700')}>
                                    <Td colSpan={7} fontWeight="bold">{month}</Td>
                                </Tr>
                                {rowsByMonth[month]?.map(row=>(
                                    <Tr key={`${month}-${row.lob}`}>
                                        <Td>{row.month}</Td>
                                        <Td>{row.lob}</Td>
                                        <Td isNumeric>{row.received.toLocaleString()}</Td>
                                        <Td isNumeric>{row.loaded.toLocaleString()}</Td>
                                        <Td>
                                            <Badge colorScheme={row.balanced?'green':'red'}>{row.balanced?'Yes':'No'}</Badge>
                                        </Td>
                                        <Td>{row.recVsLoad}</Td>
                                        <Td isNumeric>
                                            {row.received - row.loaded >=0 ? '+' : ''}
                                            {row.received - row.loaded}
                                        </Td>
                                    </Tr>
                                ))}
                            </React.Fragment>
                        ))}
                    </Tbody>
                </Table>
            </Box>

            {/* Charts */}
            <SimpleGrid columns={2} gap={6}>
                <Box bg={cardBg} p={6} borderRadius="xl" shadow="md">
                    <Heading size="md" mb={2} textAlign="center">Billing Trends</Heading>
                    <Text fontSize="sm" color="gray.500" mb={4} textAlign="center">
                        Facets vs Self Billed Amount (Last 12 Mo)
                    </Text>
                    <LineChart
                        data={useMemo(()=>{
                            const months = MONTHS_12_DESC.slice().reverse();
                            return months.map(m=>({
                                month:m,
                                'Facets Billed': isLob
                                    ? lobLast12MonthsAggregate[selectedLob]?.facetsBilledAmount || 0
                                    : Object.values(lobMonthData).reduce((sum,lobM)=>sum+(lobM[m]?.facetsBilledAmount||0),0),
                                'Self Billed': isLob
                                    ? lobLast12MonthsAggregate[selectedLob]?.selfBilledAmount || 0
                                    : Object.values(lobMonthData).reduce((sum,lobM)=>sum+(lobM[m]?.selfBilledAmount||0),0)
                            }));
                        },[isLob,selectedLob,lobMonthData,lobLast12MonthsAggregate])}
                        xKey="month"
                        yKeys={['Facets Billed','Self Billed']}
                    />
                </Box>

                <Box bg={cardBg} p={6} borderRadius="xl" shadow="md">
                    <Heading size="md" mb={2} textAlign="center">Membership Trends</Heading>
                    <Text fontSize="sm" color="gray.500" mb={4} textAlign="center">
                        Received vs Loaded (Last 12 Mo)
                    </Text>
                    <LineChart
                        data={useMemo(()=>{
                            const months = MONTHS_12_DESC.slice().reverse();
                            return months.map(m=>({
                                month:m,
                                Received: isLob
                                    ? lobLast12MonthsAggregate[selectedLob]?.received || 0
                                    : Object.values(lobMonthData).reduce((sum,lobM)=>sum+(lobM[m]?.received||0),0),
                                Loaded: isLob
                                    ? lobLast12MonthsAggregate[selectedLob]?.loaded || 0
                                    : Object.values(lobMonthData).reduce((sum,lobM)=>sum+(lobM[m]?.loaded||0),0)
                            }));
                        },[isLob,selectedLob,lobMonthData,lobLast12MonthsAggregate])}
                        xKey="month"
                        yKeys={['Received','Loaded']}
                    />
                </Box>
            </SimpleGrid>
        </Box>
    );
};

(ClientPage as any).getLayout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;
export default ClientPage;
