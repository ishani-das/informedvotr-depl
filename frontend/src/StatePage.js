import React, {useState, useEffect} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

import { Card, CardActionArea, CardContent, Typography, Button } from '@mui/material';





const StatePage = () => {
  const { stateCode } = useParams();
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState(null);
  // const [billGeneralInfo, setBillGeneralInfo] = useState(null);
  const [posts, setPosts] = useState([]);
  const [visibleCards, setVisibleCards] = useState(6); // state variable for visible cards


  useEffect(() => {
    // getSessionList - retrieves sessions by year
    // getMasterList - retireves master bill list by session
    let sessionId;
    axios.post(`https://api.legiscan.com/?key=6ef4e9b53f820698d5d6a447dc7499c7&op=getSessionList&state=${stateCode}`).then(response => {
        console.log('resp data : ', response.data.sessions)
        const fetchedSessionId = ''+response.data.sessions[0].session_id;
        console.log('session_id for most recent session : ', fetchedSessionId)
        setSessionId(fetchedSessionId)

        // setPosts(response.data.sessions);
    }).catch(error => {
        console.error("ERROR FETCHING DATA : ", error)
    });
    
  }, [stateCode]); // what does stateCode do here??

  useEffect(() => {

    if(sessionId) { 
        console.log("THE ID : ", sessionId)

        axios.post(`https://api.legiscan.com/?key=6ef4e9b53f820698d5d6a447dc7499c7&op=getMasterList&id=${sessionId}`).then(response => {
            console.log('RESP DATA FOR THIS SESSION : ', response.data.masterlist)
            const bills = Object.values(response.data.masterlist);
            setPosts(bills);
        }).catch(error => {
            console.error("ERROR FETCHING DATA : ", error)
        })
    }
    
  }, [sessionId]);

  const handleCardClick = (billId) => {
    navigate(`/bill/${billId}`);
  };

  const handleShowMore = () => {
    setVisibleCards(prevVisibleCards => prevVisibleCards + 6);
  };

  return (
    <div>
      <br />
      <h1>Recent {stateCode} Bills</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        {posts.slice(0,visibleCards).map(post => (
          <Card key={post.bill_id} style={{ maxWidth: 345 }} onClick={() => handleCardClick(post.bill_id)}>
            <CardActionArea>
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {post.number}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {post.title}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </div>
      {visibleCards < posts.length && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
          <Button variant="contained" color="primary" onClick={handleShowMore}>
            See More
          </Button>
        </div>
      )}
    </div>
  );
}

export default StatePage;
