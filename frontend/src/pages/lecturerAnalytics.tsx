import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import Head from "next/head";
import { Heading, Box, Text, Table, Thead, Tr, Th, Tbody, Td, Spinner} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
BarChart, 
Bar, 
XAxis,
YAxis,
Tooltip, 
CartesianGrid, 
ResponsiveContainer, 
Cell,
} from "recharts";

import { candidateService, lecturerService, selectedCandidateService,} from "../services/api";
import { Candidate, Lecturer } from "../types/types";

 // This will Extend the Candidate type
interface CandidateAnalytics extends Candidate {
  selectedcount: number;
  applicantname: string;
  colormostselected?: boolean;
  colorleastSelected?: boolean;
}

export default function LecturerAnalyticspage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<CandidateAnalytics[]>([]);
  const [notSelectedCandidates, setNotSelectedCandidates] = useState<CandidateAnalytics[]>([]);
  const [selectionCounts, setSelectionCounts] = useState<{ [candidateID: number]: number }>({});

  const [isLoading, setIsLoading] = useState(true);

  // It Fetchs all data from API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [candidates, counts, lecturers] = await Promise.all([
          candidateService.getAllCandidates(),
          selectedCandidateService.getCandidateSelectionCounts(),
          lecturerService.getAllLecturers(),
        ]);

        const countMap: { [key: string]: number } = {};
        counts.forEach((entry) => {
          countMap[entry.candidateID] = entry.selectedcount;
        });
        setSelectionCounts(countMap);

        setCandidates(candidates);
        setLecturers(lecturers);
      } catch (error) {
        console.error("Failed to fetch analytics data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // It  initial load & processing the data
  useEffect(() => {
    if (!candidates.length || !lecturers.length || Object.keys(selectionCounts).length === 0) return;

    const analytics: CandidateAnalytics[] = candidates.map((candidate) => {
      const selectedcount = selectionCounts[candidate.candidateID] || 0;

      return {
        ...candidate,
        selectedcount,
        applicantname: candidate.user?.firstName,
      };
    });

    // It Splits each candidates into selected & not selected
    const selected = analytics.filter((c) => c.selectedcount > 0);
    const notSelected = analytics.filter((c) => c.selectedcount === 0);
    setNotSelectedCandidates(notSelected);

    // counts which most & least selected
    const counts = selected.map((c) => c.selectedcount);
    const mostSelected = Math.max(...counts);
    const leastSelected = Math.min(...counts);
    const allEqual = mostSelected === leastSelected;

    const result = selected.map((c) => ({
      ...c,
      colormostselected: !allEqual && c.selectedcount == mostSelected,
      colorleastSelected: !allEqual && c.selectedcount == leastSelected,
    }));

    const sorted = result.sort((a, b) => b.selectedcount - a.selectedcount);
    setFilteredCandidates(sorted);
  }, [candidates, lecturers, selectionCounts]);

  return (
    <div className="lecturer-layout">
      <Head>
        <title>Lecturer Page - Applicant Analytics</title>
        <meta name="description" content="Lecturer Page - View Applicants Analytics" />
      </Head>

      <Sidebar />
      <main className="main">
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
            <Spinner size="xl" color="red.500" />
          </Box>
        ) : (
          <div>
          <Heading>📈 Analytics & Visualisation</Heading>
          {/* Summary Dashboard */}
          <Box className="summary-cards" display="flex" gap="20px" flexWrap="wrap" mt={4}>
            <Box borderWidth="1px" borderRadius="md" p={4} flex="1" minW="200px" bg="orange.50">
              <Text fontWeight="bold">Total Candidates</Text>
              <Text fontSize="xl">{candidates.length}</Text>
            </Box>
            <Box borderWidth="1px" borderRadius="md" p={4} flex="1" minW="200px" bg="red.50">
              <Text fontWeight="bold">Total Selections</Text>
              <Text fontSize="xl">{Object.values(selectionCounts).reduce((acc, count) => acc + count, 0)}</Text>
            </Box>
          </Box>

          {/*Bar Chart */}
          <Box mt={8}>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={filteredCandidates}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="applicantname" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="selectedcount" barSize={30}>
                  {filteredCandidates.map((candidate, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        candidate.colormostselected
                          ? "green"
                          : candidate.colorleastSelected
                          ? "orange"
                          : "blue"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Legend */}  
            <Box className="chart-legend" mt={4}>
              <Box className="legend-it">
                <Box className="color-box legend-green" />
                <Text className="legend-text-green">Most Chosen Candidate</Text>
              </Box>
              <Box className="legend-it">
                <Box className="color-box legend-orange" />
                <Text className="legend-text-orange">Least Chosen Candidate (Non-zero)</Text>
              </Box>
              <Box className="legend-it">
                <Box className="color-box legend-blue" />
                <Text className="legend-text-blue">Other Selected Candidates</Text>
              </Box>
            </Box>
          </Box>

          {/* Not Selected Candidates */}
          {notSelectedCandidates.length > 0 && (
            <Box mt={10} borderWidth="1px" borderRadius="md" p={5}>
              <Heading size="md" mb={4}>
                ❌ Candidates Not Selected by Any Lecturer
              </Heading>
              <Table variant="simple" colorScheme="gray">
                <Thead>
                  <Tr>
                    <Th>#</Th>
                    <Th>Name</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {notSelectedCandidates.map((candidate, index) => (
                    <Tr key={candidate.candidateID}>
                      <Td>{index + 1}</Td>
                      <Td>{candidate.user?.firstName}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
