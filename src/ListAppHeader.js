import React, { Component } from "react";
import { Link } from 'react-router-dom';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Table from '@material-ui/core/Table';
import { Button, TextField, Checkbox } from '@material-ui/core';

class ListAppHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lists: [ { id: 1, name: "My list"} ]
    };
  }

  componentDidMount = () => {
    this.fetchLists();
  }

  fetchLists = () => {
    fetch("/api/list", {
      headers: {
        "Accept": "application/json"
      },
      credentials: "same-origin"
    })
    .then((response) => response.json())
    .then((data) => {
      this.setState({ lists: data });
    })
    .catch(function(error) {
      console.log(error);
    });
  }

  saveNewList = () => {
    const list = {
      name: document.getElementById('name').value,
      hasCount: document.getElementById('hasCount').checked,
      hasCheckbox: document.getElementById('hasCheckbox').checked
    };
    document.getElementById('name').value = "";
    document.getElementById('hasCount').checked = false;
    document.getElementById('hasCheckbox').checked = false;

    const url = "/api/list";
    fetch(url, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      credentials: "same-origin",
      body: JSON.stringify(list)
    })
    .then((response) => response.json())
    .then((data) => {
      if(data.error !== undefined) {
        console.error(data.error);
        return;
      }

      let lists = Object.assign([], this.state.lists);
      lists.push(data);
      this.setState({ lists: lists });
    })
    .catch(function(error) {
      console.error(error);
    });
  }

  render = () => {
    return <div>
      <TableContainer>
        <Table aria-label="table">
          <TableHead>
            <TableRow key={"title"}>
              <TableCell style={ {textAlign: 'center'} }>
                <h4>Lists</h4>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell style={ {paddingBottom: 0} }>
                <TextField id="name" fullWidth />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell style={ {textAlign: 'center'} }>
                <label htmlFor="hasCount">Add counter</label>
                <Checkbox id="hasCount" />
                <label htmlFor="hasCheckbox">Add checkbox</label>
                <Checkbox id="hasCheckbox" />
                <Button color="primary" variant="contained" onClick={this.saveNewList}>New list</Button>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {this.state.lists.map((list) => {
              return <TableRow>
                <TableCell style={ {fontSize: '150%', textAlign: 'center'} }>
                  <a href={"/lists/" + list.id}>
                    <Button color="primary">{list.name}</Button>
                  </a>
                </TableCell>
              </TableRow>;
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>;
  }
}

export default ListAppHeader;
