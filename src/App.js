import React from "react";
import "./App.css";
import { Web3Storage } from "web3.storage/dist/bundle.esm.min.js";
import { CircularProgress } from "@material-ui/core";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import { token } from "./data";
// import dotenv from "dotenv";
// dotenv.config();

const App = () => {
  const [filesInput, setFile] = React.useState([]);
  const [fileUploading, setFileUploading] = React.useState(false);
  const [retrivedFiles, setRetrivedFile] = React.useState([]);

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
  return (
    <div className="App">
      <h3>Certificate Upload</h3>
      <form className="form">
        <input
          type="file"
          name="data"
          onChange={handleChange}
          class="fileInput"
        />
        <button type="submit" className="btn" onClick={handleSubmit}>
          Upload file
        </button>
        <div className="loader">
          {fileUploading ? <CircularProgress /> : <></>}
        </div>
      </form>
      <div>
        <TableContainer component={Paper}>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Link for the Certificate</TableCell>
                <TableCell align="right">Name of file</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {retrivedFiles.map((file) => (
                <TableRow key={file.name}>
                  <TableCell component="th" scope="row">
                    <a href={`https://${file.cid}.ipfs.dweb.link/${file.name}`}>
                      View File
                    </a>
                  </TableCell>
                  <TableCell align="right">{file.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
};

export default App;
