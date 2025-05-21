'use client';

import React, { useState } from 'react';
import AdminLayout from 'layouts/admin';
import {
    Box,
    Flex,
    Heading,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Select,
    Badge,
    Button,
    useColorModeValue,
    SimpleGrid,
} from '@chakra-ui/react';
import {
    MdInsertDriveFile,
    MdCheckCircle,
    MdErrorOutline,
    MdWarning,
} from 'react-icons/md';
import MiniStatistics from 'components/card/MiniStatistics';
import IconBox from 'components/icons/IconBox';
import { useFileData } from 'contexts/FileDataContext';

const getTagByPercentage = (fileCount: number, facetsCount: number) => {
    const pct = (facetsCount / fileCount) * 100;
    if (pct >= 95) return <Badge colorScheme="green" variant="subtle">Balanced</Badge>;
    if (pct >= 90) return <Badge colorScheme="yellow" variant="subtle">Partial</Badge>;
    return <Badge colorScheme="red" variant="subtle">Unbalanced</Badge>;
};

const getMismatchTag = (a: number, b: number) => {
    const ok = a === b;
    return (
        <Badge ml={2} colorScheme={ok ? 'green' : 'red'} variant="subtle" fontWeight="medium">
            {a} / {b} – {ok ? 'Balanced' : 'Mismatch'}
        </Badge>
    );
};

const FileInsightsPage: React.FC = () => {
    const { files, loading, error } = useFileData();
    const [selectedClient, setSelectedClient] = useState<string>('');
    const [selectedMonth, setSelectedMonth] = useState<string>('');

    const bg = useColorModeValue('secondaryGray.300', 'gray.800');
    const boxBg = useColorModeValue('white', 'gray.800');
    const brandColor = useColorModeValue('brand.500', 'white');

    // Derive list of unique clients and months from files
    const clients = Array.from(new Set(files.map(f => f.client))).sort();
    const months = Array.from(new Set(files.map(f => f.receivedDate.slice(0, 7)))).sort();

    // If no client selected, default to first client available after data loads
    React.useEffect(() => {
        if (!selectedClient && clients.length > 0) {
            setSelectedClient(clients[0]);
        }
    }, [clients, selectedClient]);

    // Filter files by selected client and month (if any)
    const filtered = files.filter(f => {
        if (selectedClient && f.client !== selectedClient) return false;
        if (selectedMonth && !f.receivedDate.startsWith(selectedMonth)) return false;
        return true;
    });

    const total = filtered.length;
    const errorFree = filtered.filter(f => f.errorCount === 0).length;
    const errorCount = total - errorFree;
    const avgErrors = total > 0 ? Math.round(filtered.reduce((sum, f) => sum + f.errorCount, 0) / total) : 0;

    // State for showing error details popup
    const [fileForErrors, setFileForErrors] = useState<any | null>(null);

    if (loading) return <Box pt="130px" px={6}><Heading>Loading files...</Heading></Box>;
    if (error) return <Box pt="130px" px={6}><Heading color="red.500">Error: {error}</Heading></Box>;

    return (
        <Box pt={{ base: '130px', md: '80px' }} px={6} bg={bg} minH="100vh">
            <Heading mb={4}>File Insights</Heading>

            <Flex gap={4} mb={6}>
                <Select
                    maxW="200px"
                    bg="white"
                    value={selectedClient}
                    onChange={e => setSelectedClient(e.target.value)}
                >
                    {clients.map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </Select>

                <Select
                    maxW="200px"
                    bg="white"
                    value={selectedMonth}
                    onChange={e => setSelectedMonth(e.target.value)}
                >
                    <option value="">-- All Months --</option>
                    {months.map(m => (
                        <option key={m} value={m}>{m}</option>
                    ))}
                </Select>
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 4 }} gap={6} mb={6}>
                <MiniStatistics
                    name="Files Loaded"
                    value={`${total}`}
                    startContent={<IconBox icon={<MdInsertDriveFile color={brandColor} />} w="56px" h="56px" bg={boxBg} />}
                />
                <MiniStatistics
                    name="Error-Free Files"
                    value={`${errorFree}`}
                    startContent={<IconBox icon={<MdCheckCircle color="green" />} w="56px" h="56px" bg={boxBg} />}
                />
                <MiniStatistics
                    name="Error Files"
                    value={`${errorCount}`}
                    startContent={<IconBox icon={<MdErrorOutline color="red" />} w="56px" h="56px" bg={boxBg} />}
                />
                <MiniStatistics
                    name="Avg. Errors"
                    value={`${avgErrors}`}
                    startContent={<IconBox icon={<MdWarning color="orange" />} w="56px" h="56px" bg={boxBg} />}
                />
            </SimpleGrid>

            <Box bg={boxBg} p={6} borderRadius="xl" shadow="md" overflowX="auto" mb={6}>
                <Table variant="simple" size="md" whiteSpace="nowrap" minW="900px">
                    <Thead bg={useColorModeValue('gray.100', 'gray.700')}>
                        <Tr>
                            <Th>File</Th>
                            <Th>Date</Th>
                            <Th>Members</Th>
                            <Th>Loaded</Th>
                            <Th>Balanced</Th>
                            <Th>Unbal %</Th>
                            <Th>Total</Th>
                            <Th>Active</Th>
                            <Th>Termed</Th>
                            <Th>Future</Th>
                            <Th>Errors</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {filtered.map((f, i) => {
                            const ubPct = (((f.fileCount - f.facetsCount) / f.fileCount) * 100).toFixed(1);
                            return (
                                <Tr
                                    key={i}
                                    _hover={{ bg: useColorModeValue('gray.100', 'gray.700'), cursor: f.errorCount > 0 ? 'pointer' : 'default' }}
                                    onClick={() => {
                                        if (f.errorCount > 0) {
                                            setFileForErrors(f);
                                        }
                                    }}
                                >
                                    <Td fontWeight="bold" color={brandColor}>{f.fileNo}</Td>
                                    <Td>{f.receivedDate}</Td>
                                    <Td>{f.fileCount.toLocaleString()}</Td>
                                    <Td>{f.facetsCount.toLocaleString()}</Td>
                                    <Td>{getTagByPercentage(f.fileCount, f.facetsCount)}</Td>
                                    <Td>{ubPct}%</Td>
                                    <Td>{getMismatchTag(f.fileCount, f.facetsCount)}</Td>
                                    <Td>{getMismatchTag(f.activeFile, f.activeFacets)}</Td>
                                    <Td>{getMismatchTag(f.termedFile, f.termedFacets)}</Td>
                                    <Td>{getMismatchTag(f.futureFile, f.futureFacets)}</Td>
                                    <Td>
                                        <Badge
                                            colorScheme={f.errorCount > 0 ? 'red' : 'green'}
                                            variant="subtle"
                                            cursor={f.errorCount > 0 ? 'pointer' : 'default'}
                                            onClick={e => {
                                                e.stopPropagation();
                                                if (f.errorCount > 0) setFileForErrors(f);
                                            }}
                                        >
                                            {f.errorCount}
                                        </Badge>
                                    </Td>
                                </Tr>
                            );
                        })}
                    </Tbody>
                </Table>
            </Box>

            {fileForErrors && (
                <Box
                    position="fixed"
                    top={0}
                    left={0}
                    w="100vw"
                    h="100vh"
                    bg="rgba(0,0,0,0.5)"
                    zIndex={9999}
                    onClick={() => setFileForErrors(null)}
                >
                    <Flex align="center" justify="center" h="100%">
                        <Box
                            bg={boxBg}
                            p={6}
                            borderRadius="xl"
                            shadow="lg"
                            w={{ base: '90%', md: '500px' }}
                            maxH="80vh"
                            overflowY="auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <Heading size="md" mb={4}>Error Details for {fileForErrors.fileNo}</Heading>
                            {fileForErrors.mismatchReason?.length ? (
                                <Table size="sm" variant="simple" mb={4}>
                                    <Thead>
                                        <Tr>
                                            <Th>Reason</Th>
                                            <Th>Count</Th>
                                            <Th>Line</Th>
                                            <Th>Description</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {fileForErrors.mismatchReason.map((err, idx) => (
                                            <Tr key={idx}>
                                                <Td>{err.category}</Td>
                                                <Td>{err.count}</Td>
                                                <Td>{err.exampleLine}</Td>
                                                <Td>{err.description}</Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            ) : (
                                <Box>No errors reported.</Box>
                            )}
                            <Button colorScheme="brand" onClick={() => setFileForErrors(null)}>Close</Button>
                        </Box>
                    </Flex>
                </Box>
            )}
        </Box>
    );
};

(FileInsightsPage as any).getLayout = page => <AdminLayout>{page}</AdminLayout>;

export default FileInsightsPage;
