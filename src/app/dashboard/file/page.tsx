'use client';

import React, { useState } from "react";
import AdminLayout from "layouts/admin";
import {
    Box,
    Flex,
    Heading,
    SimpleGrid,
    Text,
    Badge,
    Tag,
    Select,
    Icon,
    useColorModeValue,
} from "@chakra-ui/react";
import {
    MdInsertDriveFile,
    MdPeopleOutline,
    MdErrorOutline,
    MdCheckCircle,
    MdWarning,
    MdGroups,
} from "react-icons/md";
import MiniStatistics from "components/card/MiniStatistics";
import IconBox from "components/icons/IconBox";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const fileData = [
    {
        fileNo: "F001",
        client: "Client A",
        clientId: "1001",
        receivedDate: "2024-12-01",
        fileType: "Eligibility",
        fileStatus: "Processed",
        fileCount: 5800,
        facetsCount: 5000,
        activeFile: 5000,
        activeFacets: 4000,
        termedFile: 500,
        termedFacets: 500,
        futureFile: 500,
        futureFacets: 500,
        errorCount: 12,
        errorDescription: "Missing DOB, Invalid Plan",
        mismatchReason: [
            { category: "Not in Facets", count: 120 },
            { category: "Not in File", count: 80 },
        ],
    },
    {
        fileNo: "F002",
        client: "Client B",
        clientId: "1002",
        receivedDate: "2024-12-05",
        fileType: "Eligibility",
        fileStatus: "Processed",
        fileCount: 6000,
        facetsCount: 6000,
        activeFile: 4500,
        activeFacets: 4500,
        termedFile: 800,
        termedFacets: 800,
        futureFile: 700,
        futureFacets: 700,
        errorCount: 0,
        errorDescription: "",
        mismatchReason: [],
    },
    {
        fileNo: "F003",
        client: "Client C",
        clientId: "1003",
        receivedDate: "2024-12-10",
        fileType: "Eligibility",
        fileStatus: "Processed",
        fileCount: 5200,
        facetsCount: 5200,
        activeFile: 4100,
        activeFacets: 4100,
        termedFile: 600,
        termedFacets: 600,
        futureFile: 500,
        futureFacets: 500,
        errorCount: 0,
        errorDescription: "",
        mismatchReason: [],
    },
];

const FancyBarChart = ({ data }: any) => {
    const categories = data.map((d: any) => d.category);
    const series = [
        {
            name: "File",
            data: data.map((d: any) => d.File),
        },
        {
            name: "Facets",
            data: data.map((d: any) => d.Facets),
        },
    ];

    const options = {
        chart: {
            type: "bar",
            toolbar: { show: false },
        },
        xaxis: { categories },
        plotOptions: {
            bar: {
                columnWidth: "50%",
                borderRadius: 6,
            },
        },
        fill: {
            type: "gradient",
            gradient: {
                shade: "light",
                type: "vertical",
                gradientToColors: ["#FF612B", "#F2B411"],
                stops: [0, 100],
            },
        },
        colors: ["#FF612B", "#F2B411"],
        dataLabels: { enabled: false },
        legend: { position: "top" },
    };

    return <Chart options={options} series={series} type="bar" height={350} />;
};

const FancyPieChart = ({ facetsCount, unmatchedCount }: any) => {
    const series = [facetsCount, unmatchedCount];
    const options = {
        chart: {
            type: 'donut'
        },
        labels: ["Balanced", "Unmatched"],
        plotOptions: {
            pie: {
                donut: {
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: "Total",
                            formatter: () => `${series.reduce((a, b) => a + b, 0)}`,
                        },
                    },
                },
            },
        },
        legend: {
            position: 'right',
        },
        colors: ['#00C49F', '#FF4C61'],
    };

    return <Chart options={options} series={series} type="donut" height={350} />;
};

const FileLevelPage: React.FC = () => {
    const [selectedFileIndex, setSelectedFileIndex] = useState(0);
    const file = fileData[selectedFileIndex];
    const boxBg = useColorModeValue("white", "gray.800");
    const brandColor = useColorModeValue("brand.500", "white");
    const bg = useColorModeValue("secondaryGray.300", "gray.800");

    const groupedCounts = [
        { category: "Total", File: file.fileCount, Facets: file.facetsCount },
        { category: "Active", File: file.activeFile, Facets: file.activeFacets },
        { category: "Termed", File: file.termedFile, Facets: file.termedFacets },
        { category: "Future", File: file.futureFile, Facets: file.futureFacets },
    ];

    const isBalanced = groupedCounts.every(row => row.File === row.Facets);

    return (
        <Box pt={{ base: "130px", md: "80px", xl: "80px" }} px={6} bg={bg} minH="100vh">
            <Heading size="lg" mb={2}>File-Level Eligibility Dashboard</Heading>
            <Flex justify="space-between" align="center" mb={6}>
                <Text fontSize="md" color="gray.600">
                    Client: {file.client} | File No: {file.fileNo} | Received: {file.receivedDate}
                </Text>
                <Select w="240px" value={selectedFileIndex} onChange={(e) => setSelectedFileIndex(Number(e.target.value))}>
                    {fileData.map((f, i) => (
                        <option value={i} key={f.fileNo}>{f.client} - {f.fileNo}</option>
                    ))}
                </Select>
            </Flex>

            <Flex gap={4} mb={6} align="center">
                <Tag colorScheme="blue">Type: {file.fileType}</Tag>
                <Tag colorScheme="green">Status: {file.fileStatus}</Tag>
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6} mb={6}>
                <MiniStatistics name="File Members" value={file.fileCount.toString()} startContent={<IconBox icon={<MdInsertDriveFile />} w="56px" h="56px" bg={boxBg} />} />
                <MiniStatistics name="Facets Members" value={file.facetsCount.toString()} startContent={<IconBox icon={<MdGroups />} w="56px" h="56px" bg={boxBg} />} />
                <MiniStatistics name="Errors" value={file.errorCount.toString()} startContent={<IconBox icon={<MdErrorOutline />} w="56px" h="56px" bg={boxBg} />} />
                <MiniStatistics name="Balanced" value={isBalanced ? "Yes" : "No"} startContent={<IconBox icon={<Icon as={isBalanced ? MdCheckCircle : MdWarning} color={isBalanced ? "green.400" : "red.400"} />} w="56px" h="56px" bg={boxBg} />} />
            </SimpleGrid>

            <Box bg={boxBg} p={6} borderRadius="xl" shadow="md" mb={6}>
                <Heading size="md" mb={4}>File vs Facets Comparison</Heading>
                <FancyBarChart data={groupedCounts} />
            </Box>

            <SimpleGrid columns={{ base: 1, md: 2 }} gap={6} mb={6}>
                <Box bg={boxBg} p={6} borderRadius="xl" shadow="md">
                    <Heading size="md" mb={2}>Error Details</Heading>
                    <Text>{file.errorDescription || "No errors reported."}</Text>
                </Box>

                <Box bg={boxBg} p={6} borderRadius="xl" shadow="md">
                    <Heading size="md" mb={2}>Balanced Scorecard</Heading>
                    {groupedCounts.map((row) => (
                        <Text key={row.category}>
                            {row.category}: {row.File} / {row.Facets} –
                            <Badge ml={2} colorScheme={row.File === row.Facets ? "green" : "red"}>
                                {row.File === row.Facets ? "Balanced" : "Mismatch"}
                            </Badge>
                        </Text>
                    ))}
                </Box>
            </SimpleGrid>

            {file.mismatchReason.length > 0 && (
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
                    <Box bg={boxBg} p={6} borderRadius="xl" shadow="md">
                        <Heading size="md" mb={4}>Mismatch Breakdown</Heading>
                        <FancyBarChart data={file.mismatchReason.map(d => ({ category: d.category, File: d.count, Facets: 0 }))} />
                    </Box>

                    <Box bg={boxBg} p={6} borderRadius="xl" shadow="md">
                        <Heading size="md" mb={4}>Balanced vs Mismatch</Heading>
                        <FancyPieChart facetsCount={file.facetsCount} unmatchedCount={file.mismatchReason.reduce((acc, r) => acc + r.count, 0)} />
                    </Box>
                </SimpleGrid>
            )}
        </Box>
    );
};

(FileLevelPage as any).getLayout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;

export default FileLevelPage;
