import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { styled } from "@mui/material/styles";
import MuiButton from "@mui/material/Button";
import { Typography, Container, CircularProgress, /*Button, */Card, CardMedia, CardContent, Grid, CardActionArea, Box } from '@mui/material';
import HtmlContent from './HtmlContent';
import { htmlToText } from 'html-to-text';
import { fetchSearchResults } from './googleSearchService';

export const Button = styled(MuiButton)(({ pill }) => ({
  borderRadius: pill ? 50 : 4,
  // background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)', 
  background: 'linear-gradient(45deg, #0ea2e6 30%, #bd4242 90%)',
  color: 'white', 
  // '&:hover': {
  //   background: 'linear-gradient(45deg, #3470ad 30%, #0ea2e6 90%)', 
  // },
}));

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
      // const response = await axios.post('http://127.0.0.1:5000/summarize', { text: plainText }); 
      // setSummary(response.data[0].summary_text);
      // const response = await axios.post('http://127.0.0.1:5000/summarize_groq', { text: plainText }); 
      const response = await axios.post('https://iv-backend-new-37160a2e20fa.herokuapp.com/summarize_groq', { text: plainText }); 
      setSummary(response.data.summarized_text);
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
      <br />
      <br />
      <Typography variant="h4" gutterBottom style={{ fontWeight: 'bold' }}>
        {billDetails.bill_number} - <a href={billDetails.url} target="_blank" rel="noopener noreferrer">
          {billDetails.title}
        </a>
      </Typography>
      <Typography variant="h6" paragraph style={{ fontStyle: 'italic' }}>
        {billDetails.description}
      </Typography>
      <br />
      <Typography variant="h5" gutterBottom align="center" style={{ fontWeight: 'bold' }}>
          Confused?
      </Typography>
      <br />
      {billTextInHTML && (
        <div>
          <Grid container justifyContent="center" mb={2}>
            <Button variant="outlined" pill size="large" onClick={summarizeText}
            sx={{
              padding: '12px 24px',  // Adjust padding as needed
              fontSize: '1.2rem',    // Adjust font size as needed
              fontWeight: 'bold',    // Make the text bold
            }}
            >
            {/* <Button size = "large" variant="text" color="primary" onClick={summarizeText}> */}
              Let us summarize it for you! ✨
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
             <Typography sx={{ fontSize: '18px' }} color="textSecondary">
              {/* <h2>Summary</h2> */}
              <p>{summary}</p>
            </Typography>
          )}
        </div>

      )}
      <br />
      <br />
      <br />
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
