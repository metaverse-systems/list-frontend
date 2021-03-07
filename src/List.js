import React, { Component } from "react";
import { Link } from 'react-router-dom';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Table from '@material-ui/core/Table';
import { Button, TextField, Checkbox } from '@material-ui/core';

const NewEntry = (props) => {
  return <TableRow>
    <TableCell>
      {props.hasCount ?
       <TextField id="entry_count" name="count" defaultValue={props.count} onChange={props.onChange} /> :
       <></>}
    </TableCell>
    <TableCell><TextField id="entry_text" name="text" fullWidth onChange={props.onChange} /></TableCell>
    <TableCell>
      {props.hasCheckbox ?
       <Checkbox checked={props.checked} id="entry_checked" name="checked" onChange={props.onChange} /> :
       <></>}
    </TableCell>
    <TableCell>
      <Button onClick={props.save}>Add</Button></TableCell>
  </TableRow>;
}

const ListEntry = (props) => {
  return <TableRow>
    <TableCell>
      {props.hasCount ?
      <>{props.count}</> :
      <></>}
    </TableCell>
    <TableCell>{props.text}</TableCell>
    <TableCell>
      {props.hasCheckbox ?
       <Checkbox checked={props.checked} onChange={() => props.toggleCheckbox(props.entryKey)} /> :
       <></>}
    </TableCell>
    <TableCell>
      <Button color="secondary" onClick={() => props.deleteEntry(props.id)}>Delete</Button>
    </TableCell>
  </TableRow>;
}

class List extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: props.list_id,
      hasCheckbox: false,
      hasCount: false,
      name: "Loading...",
      entries: [],
      editEntry: {
        text: "",
        checked: false,
        count: 0
      }
    };
  }

  componentDidMount = () => {
    this.fetchList();
    this.fetchEntries();
  }

  fetchList = () => {
    const url = "/api/list/" + this.state.id;
    fetch(url, {
      headers: {
        "Accept": "application/json"
      },
      credentials: "same-origin"
    })
    .then((response) => response.json())
    .then((data) => {
      this.setState({ name: data.name, hasCheckbox: data.hasCheckbox, hasCount: data.hasCount });
    })
    .catch(function(error) {
      console.log(error);
    });
  }

  fetchEntries = () => {
    const url = "/api/list/" + this.state.id + "/entry";
    fetch(url, {
      headers: {
        "Accept": "application/json"
      },
      credentials: "same-origin"
    })
    .then((response) => response.json())
    .then((data) => {
      this.setState({ entries: data });
    })
    .catch(function(error) {
      console.log(error);
    });
  }

  saveNewEntry = () => {
    const entry = {
      text: document.getElementById('entry_text').value
    };
    document.getElementById('entry_text').value = "";

    if(this.state.hasCount) {
      entry.count = document.getElementById('entry_count').value;
    } else {
      entry.count = 0;
    }

    if(this.state.hasCheckbox) {
      entry.checked = document.getElementById('entry_checked').checked;
    } else {
      entry.checked = false;
    }

    const url = "/api/list/" + this.state.id + "/entry";
    fetch(url, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      credentials: "same-origin",
      body: JSON.stringify(entry)
    })
    .then((response) => response.json())
    .then((data) => {
      if(data.error !== undefined) {
        console.error(data.error);
        return;
      }

      let entries = Object.assign([], this.state.entries);
      entries.push(data);
      this.setState({
        entries: entries,
        editEntry: {
          text: "",
          checked: false,
          count: 0
        }
      });
    })
    .catch(function(error) {
      console.error(error);
    });
  }

  onChange = (event) => {
    event.persist();

    let editEntry = Object.assign({} , this.state.editEntry);
    switch(event.target.type) {
      case "checkbox":
        editEntry[event.target.name] = event.target.checked;
        break;
      default:
        editEntry[event.target.name] = event.target.value;
        break;
    }
    this.setState({ editEntry: editEntry  });
  }

  deleteEntry = (entry_id) => {
    const url = "/api/list/" + this.state.id + "/entry/" + entry_id;
    fetch(url, {
      method: 'DELETE',
      headers: {
        "Accept": "application/json"
      },
      credentials: "same-origin"
    })
    .then((response) => response.json())
    .then((data) => {
      if(data.error !== undefined) {
        console.error(data.error);
        return;
      }

      let entries = Object.assign([], this.state.entries);
      entries = entries.filter(entry => entry.id !== entry_id);
      this.setState({ entries: entries });
    })
    .catch(function(error) {
      console.error(error);
    });
  }

  toggleCheckbox = (i) => {
    let entries = Object.assign([], this.state.entries);
    entries[i].checked = !entries[i].checked;
    this.setState({ entries: entries });

    const url = "/api/list/" + this.state.id + "/entry/" + entries[i].id;
    fetch(url, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      credentials: "same-origin",
      body: JSON.stringify(entries[i])
    })
    .then((response) => response.json())
    .then((data) => {
      if(data.error !== undefined) {
        console.error(data.error);
        return;
      }
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
              <TableCell style={ {textAlign: 'center'} } colSpan={4}>
                <h3>{this.state.name}</h3>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {this.state.entries.map((entry, i) => 
              <ListEntry key={i} entryKey={i} {...entry} 
                         hasCheckbox={this.state.hasCheckbox}
                         hasCount={this.state.hasCount}
                         deleteEntry={this.deleteEntry}
                         toggleCheckbox={this.toggleCheckbox}
              />)}
            <NewEntry save={this.saveNewEntry} onChange={this.onChange} {...this.state.editEntry} 
                       hasCheckbox={this.state.hasCheckbox} hasCount={this.state.hasCount} />
          </TableBody>
        </Table>
      </TableContainer>
    </div>;
  }
}

export default List;
