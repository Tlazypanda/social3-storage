import * as React from "react";
import "./App.css";
import { Web3Storage } from "web3.storage/dist/bundle.esm.min.js";
import CircularProgress from "@mui/material/CircularProgress";
import { token } from "./data";
import BackupIcon from "@mui/icons-material/Backup";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import { Typography } from "@mui/material";
import Link from "@mui/material/Link";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

const Input = styled("input")({
  display: "none",
});

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const App = () => {
  const [filesInput, setFile] = React.useState([]);
  const [fileUploading, setFileUploading] = React.useState(false);
  const [retrivedFiles, setRetrivedFile] = React.useState([]);
  const [fileSelected, setFileSelected] = React.useState(null);
  const [open, setOpen] = React.useState(false);

  async function retrieveFiles(cid) {
    console.log(cid);
    const client = makeStorageClient();
    const res = await client.get(cid);
    console.log(`Got a response! [${res.status}] ${res.statusText}`);
    if (!res.ok) {
      throw new Error(
        `failed to get ${cid} - [${res.status}] ${res.statusText}`
      );
    }

    // unpack File objects from the response
    console.log(res);
    const filesUp = await res.files();
    console.log(filesUp);
    for (const file of filesUp) {
      console.log(`${file.cid} -- ${file.name} -- ${file.size}`);
    }
    console.log(retrivedFiles);
    setRetrivedFile(filesUp);
    setOpen(true);
    setFileSelected(null);
  }

  function makeStorageClient() {
    return new Web3Storage({
      token: token,
    });
  }

  const handleChange = (event) => {
    if (event.target.files[0]) {
      setFile((oldArr) => [...oldArr, event.target.files[0]]);
    }
    console.log(filesInput);
    setFileSelected(event.target.files[0].name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFileUploading(true);
    console.log(filesInput);
    const onRootCidReady = (cid) => {
      console.log("uploading files with cid:", cid);
    };

    // when each chunk is stored, update the percentage complete and display
    const totalSize = filesInput.map((f) => f.size).reduce((a, b) => a + b, 0);
    let uploaded = 0;

    const onStoredChunk = (size) => {
      uploaded += size;
      const pct = uploaded / totalSize;
      console.log(pct);
      console.log(`Uploading... ${pct.toFixed(2)}% complete`);
    };

    // makeStorageClient returns an authorized Web3.Storage client instance
    const client = makeStorageClient();

    // client.put will invoke our callbacks during the upload
    // and return the root cid when the upload completes
    const rsp = await client.put(filesInput, { onRootCidReady, onStoredChunk });
    console.log(rsp);
    setFileUploading(false);
    retrieveFiles(rsp);
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  return (
    <div className="App">
      <div className="headingContainer">
        <Typography variant="h4">Certificate Upload</Typography>
      </div>
      <div className="container">
        <div className="formContainer">
          <form className="form">
            <div className="formField">
              <label htmlFor="contained-button-file">
                <Input
                  id="contained-button-file"
                  type="file"
                  onChange={handleChange}
                />
                <Button variant="contained" component="span">
                  <BackupIcon /> &nbsp;
                  <Typography variant="body2"> Choose File</Typography>
                </Button>
                {fileSelected && <Typography>{fileSelected}</Typography>}
              </label>
            </div>
            <div className="formButton">
              <Button
                variant="contained"
                component="span"
                type="submit"
                className="btn"
                onClick={handleSubmit}
              >
                Upload file
              </Button>
            </div>
          </form>
        </div>
        {retrivedFiles.length > 0 && (
          <div className="listContainer">
            {retrivedFiles.map((file) => (
              <div key={file.name} className="listItem">
                <div>{file.name}</div>
                <div>
                  <Link
                    href={`https://${file.cid}.ipfs.dweb.link/${file.name}`}
                    underline="none"
                  >
                    View File
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="loader">
          {fileUploading && <CircularProgress color="secondary" />}
        </div>
      </div>
      <Snackbar open={open} autoHideDuration={4000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success" sx={{ width: "100%" }}>
          File Uploaded Succesfully
        </Alert>
      </Snackbar>
    </div>
  );
};

export default App;
