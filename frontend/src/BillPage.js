import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Typography, Container, CircularProgress, Button, Card, CardMedia, CardContent, Grid, CardActionArea, Box } from '@mui/material';
import HtmlContent from './HtmlContent';
import { htmlToText } from 'html-to-text';
import { fetchSearchResults } from './googleSearchService';


const BillPage = () => {
  const { billId } = useParams();
  const [billDetails, setBillDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [billTextInHTML, setBillTextInHTML] = useState(null);
  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const fetchBillDetails = async () => {
      try {
        const response = await axios.post(`https://api.legiscan.com/?key=6ef4e9b53f820698d5d6a447dc7499c7&op=getBill&id=${billId}`);
        console.log('Bill details:', response.data.bill);
        setBillDetails(response.data.bill);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching bill details:", error);
        setLoading(false);
      }
    };

    fetchBillDetails();
  }, [billId]);

  useEffect(() => {
    const fetchBillText = async () => {
      if (billDetails && billDetails.texts && billDetails.texts.length > 0) {
        const docId = billDetails.texts[billDetails.texts.length - 1].doc_id;
        try {
          const response = await axios.post(`https://api.legiscan.com/?key=6ef4e9b53f820698d5d6a447dc7499c7&op=getBillText&id=${docId}`);
          console.log('Bill text details:', response.data);
          /*
          setBillText(response.data.text.text_hash);
          let decodedText = atob(billText);
          console.log("DECODED TEXT : ", decodedText);
          */

          // Example Base64 encoded string
          const base64String = response.data.text.doc;
          // Decode Base64 string
          const decodedString = atob(base64String);
          // const decodedString = Buffer.from(base64String, 'base64').toString('utf-8');
          console.log(decodedString);  // Output: "Hello World"
          setBillTextInHTML(decodedString);

        } catch (error) {
          console.error("Error fetching bill text details:", error);
        }
      }
    };

    fetchBillText();
  }, [billDetails]);

  useEffect(() => {
    const fetchSearchResultsForBill = async () => {
      if (billDetails) {
        const results = await fetchSearchResults(billDetails.title);
        setSearchResults(results);
      }
    };

    fetchSearchResultsForBill();
  }, [billDetails]);

  const summarizeText = async () => {
    if (!billTextInHTML) return;
    setSummaryLoading(true);
    try {
      const plainText = htmlToText(billTextInHTML, { wordwrap: 130 });
      console.log('PLAIN TEXT : ', plainText)
      const response = await axios.post('http://127.0.0.1:5000/summarize', { text: plainText }); 
      // const response = await axios.post('https://informedvotr-backend.vercel.app/summarize', { text: plainText }); 
      // https://informedvotr-backend.vercel.app/
      // const response = await axios.post('http://127.0.0.1:5000/summarize', { text: "The tiger (Panthera tigris) is a member of the genus Panthera and the largest living cat species native to Asia. It has a powerful, muscular body with a large head and paws, a long tail and orange fur with black, mostly vertical stripes. It is traditionally classified into nine recent subspecies, though some recognise only two subspecies, mainland Asian tigers and the island tigers of the Sunda Islands. Throughout the tiger's range, it inhabits mainly forests, from coniferous and temperate broadleaf and mixed forests in the Russian Far East and Northeast China to tropical and subtropical moist broadleaf forests on the Indian subcontinent and Southeast Asia. The tiger is an apex predator and preys mainly on ungulates, which it takes by ambush. It lives a mostly solitary life and occupies home ranges, which it defends from individuals of the same sex. The range of a male tiger overlaps with that of multiple females with whom he mates. Females give birth to usually two or three cubs that stay with their mother for about two years. When becoming independent, they leave their mother's home range and establish their own. Since the early 20th century, tiger populations have lost at least 93% of their historic range and are locally extinct in West and Central Asia, in large areas of China and on the islands of Java and Bali. Today, the tiger's range is severely fragmented. It is listed as Endangered on the IUCN Red List of Threatened Species, as its range is thought to have declined by 53% to 68% since the late 1990s. Major threats to tigers are habitat destruction and fragmentation due to deforestation, poaching for fur and the illegal trade of body parts for medicinal purposes. Tigers are also victims of human–wildlife conflict as they attack and prey on livestock in areas where natural prey is scarce. The tiger is legally protected in all range countries. National conservation measures consist of action plans, anti-poaching patrols and schemes for monitoring tiger populations. In several range countries, wildlife corridors have been established and tiger reintroduction is planned. The tiger is among the most popular of the world's charismatic megafauna. It has been kept in captivity since ancient times and has been trained to perform in circuses and other entertainment shows. The tiger featured prominently in the ancient mythology and folklore of cultures throughout its historic range and has continued to appear in culture worldwide."});
      setSummary(response.data[0].summary_text);
    } catch (error) {
      console.error('Error summarizing text:', error);
      setSummary('Error summarizing text');
    } finally {
      setSummaryLoading(false);
    }
  };


  if (loading) {
    return <CircularProgress />;
  }

  if (!billDetails) {
    return <Typography variant="h6">Bill details not found.</Typography>;
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom style={{ fontWeight: 'bold' }}>
        {billDetails.bill_number} - <a href={billDetails.url} target="_blank" rel="noopener noreferrer">
          {billDetails.title}
        </a>
      </Typography>
      <Typography variant="h6" paragraph style={{ fontStyle: 'italic' }}>
        {billDetails.description}
      </Typography>

      {billTextInHTML && (
        <div>
          <Grid container justifyContent="center" mb={2}>
            <Button size = "large" variant="text" color="primary" onClick={summarizeText}>
              Confused? Let us summarize it for you!
            </Button>
          </Grid>
          {summaryLoading && <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="50vh" // Optional: To center vertically in full viewport height
            >
            <CircularProgress />
          </Box>}
          {/* <HtmlContent html={billTextInHTML}/> */}
          {summary && (
            <Typography variant="p" color="textSecondary">
              {/* <h2>Summary</h2> */}
              <p>{summary}</p>
            </Typography>
          )}
        </div>

      )}

      <Typography variant="h5" gutterBottom align="center" style={{ fontWeight: 'bold' }}>
        Related Content in the Media
      </Typography>
      <Grid container spacing={2}>
        {searchResults.map((result, index) => (
          <Grid item xs={12} sm={6} md={4} key={result.cacheId || index}>
            <Card 
              style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
              onClick={() => window.open(result.link, '_blank')}
              >
              <CardActionArea>
                {result.pagemap && result.pagemap.cse_image && result.pagemap.cse_image.length > 0 && (
                  <CardMedia
                    component="img"
                    alt={result.title}
                    height="140"
                    image={result.pagemap.cse_image[0].src}
                  />
                )}
                <CardContent style={{ flexGrow: 1 }}>
                  <Typography variant="h5" component="div">
                    {result.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {result.snippet}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>


    </Container>
  );
}

export default BillPage;
