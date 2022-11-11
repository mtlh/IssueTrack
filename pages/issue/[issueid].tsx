import { Box, CircularProgress, Grid } from "@mui/material";
import axios from "axios";
import { getCookie } from "cookies-next";
import { useEffect, useState } from "react";
import Mynav from "../comps/Mynav";
import { useRouter } from "next/router";

export default function Ticket() {
    const router = useRouter();
    const { issueid } = router.query;

    const [isAuth, setAuth] = useState(null);
    const [userid, setUserId] = useState("");
    const [IssueObj, setIssueObj] = useState(Object());
  
    useEffect( () => {
      if(!issueid) {
        return;
      }
      const fetchAuth = async () => {
        if (getCookie('login_info') != undefined) {
            var strsplit = getCookie('login_info').toString().split(",");
            var username_cookie = strsplit[0];
            var id_cookiestrsplit = strsplit[1];
            const getAuth = await axios.get("/api/Auth", {params: {id: id_cookiestrsplit, user: username_cookie}});
            if (getAuth.data.isAuth == true) {
                setAuth(getAuth.data.isAuth);
                setUserId(username_cookie);
            } else {
              setAuth(getAuth.data.isAuth);
          }
        } else {
          setAuth(false);
        }
      }
      fetchAuth();
      // ADDITIONAL AUTH TO SEE IF PART OF TEAM THAT CAN VIEW TICKET OR INDIVIDUAL.
      // Get info of issue with id passed
      const getIssueInfo = async () => {
        const getIssue = await axios.get("/api/issue/GetIssueInfo", {params: {issueID: issueid}});
        if (getIssue.data.isFound == false) {
          setAuth(false);
        } else {
          if (getIssue.data.assignval == true) {
            // check team users
            const getUserTeams = await axios.get('/api/user/GetUserInfo?userid=' + userid);
            var userteams = getUserTeams.data.teams;
            userteams = userteams.toString().split();
            var doesmatch = false;
            for (var team in userteams) {
              if (team == getIssue.data.teamusername) {
                doesmatch = true;
              }
            }
            if (doesmatch == false) {
              setAuth(false);
            }
          } else {
            // individual issue - check if auth user is same as issue created user.
            if (getIssue.data.username != userid) {
              setAuth(false);
            }
          }
          setIssueObj(getIssue.data);
        }
      }
      getIssueInfo();
    }, [issueid, isAuth]);
  
    if (isAuth == true) {
      return (
        <>
            <Mynav params={{username: userid}}/>
            <p>{IssueObj.username}</p>
        </>
      )
    } else if (isAuth == false) {
      return (
        <>
            <Grid container spacing={0} style={{justifyContent: "center", textAlign: "center"}}>
              <Grid item={true} xs={12}>
                <Box m="auto" display="flex" alignItems="center" justifyContent="center">
                  <p>You are not authorised to view this issue or it does not exist.</p>
                </Box>
              </Grid>
            </Grid>
        </>
      )
    } else {
      return (
        <>
            <Grid container spacing={0} style={{justifyContent: "center", textAlign: "center", alignItems: "center"}}>
              <Grid item={true} xs={12}>
                <Box m="auto" style={{display: "flex", justifyContent: "center", alignItems: "center", textAlign: "center", minHeight: "100vh"}}>
                    <CircularProgress />
                </Box>
              </Grid>
          </Grid>
        </>
      )
    }
}
