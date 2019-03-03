import React, { Component } from "react";
import { Route, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import NoteListNav from "../NoteListNav/NoteListNav";
import NotePageNav from "../NotePageNav/NotePageNav";
import NoteListMain from "../NoteListMain/NoteListMain";
import NotePageMain from "../NotePageMain/NotePageMain";
import AddFolder from "../AddFolder/AddFolder";
import AddNote from "../AddNote/AddNote";
import EditNote from "../EditNote/EditNote";
import ApiContext from "../ApiContext";
import config from "../config";
import "./App.css";

class App extends Component {
  state = {
    notes: [],
    folders: []
  };

  componentDidMount() {
    Promise.all([
      fetch(`${config.API_ENDPOINT}/api/notes`),
      fetch(`${config.API_ENDPOINT}/api/folders`)
    ])
      .then(([notesRes, foldersRes]) => {
        if (!notesRes.ok) return notesRes.json().then(e => Promise.reject(e));
        if (!foldersRes.ok)
          return foldersRes.json().then(e => Promise.reject(e));

        return Promise.all([notesRes.json(), foldersRes.json()]);
      })
      .then(([notes, folders]) => {
        this.setState({ notes, folders });
      })
      .catch(error => {
        console.error({ error });
      });
  }

  handleAddFolder = folder => {
    this.setState({
      folders: [...this.state.folders, folder]
    });
  };

  handleEditNote = (note, noteId) => {
    this.setState({
      notes: [...this.state.notes.filter(note => note.id !== noteId), note]

      //[...this.state.notes, ]
    });
  };

  handleAddNote = note => {
    this.setState({
      notes: [...this.state.notes, note]
    });
  };

  handleDeleteNote = noteId => {
    this.setState({
      notes: this.state.notes.filter(note => note.id !== noteId)
    });
  };

  renderNavRoutes() {
    return (
      <>
        <Route exact key="/" path="/" component={NoteListNav} />
        <Route
          exact
          key="/folder/:folderId"
          path="/folder/:folderId"
          component={NoteListNav}
        />
        <Route path="/note/:noteId" component={NotePageNav} />
        <Route path="/add-folder" component={NotePageNav} />
        <Route path="/add-note" component={NotePageNav} />
        <Route path="/edit-note" component={NotePageNav} />
      </>
    );
  }

  renderMainRoutes() {
    return (
      <>
        <Route exact key="/" path="/" component={NoteListMain} />
        <Route
          exact
          key="/folder/:folderId"
          path="/folder/:folderId"
          component={NoteListMain}
        />
        <Route path="/note/:noteId" component={NotePageMain} />
        <Route path="/add-folder" component={AddFolder} />
        <Route path="/add-note" component={AddNote} />
        <Route path="/edit-note" component={EditNote} />
      </>
    );
  }

  //line 98 structural issue; EditNote is being passed as an individual component that needs access to
  //several props (namely id) which is found with this.props.match.params [See NotePageMain line 25].
  //The Note component took care of deleting and was nested in the NotePageMain component.
  //Potential solution to this would be to create new component NoteEditPageMain and render EditNote inside of that
  //and pass props to it similar to how it was done with delete. Props that were accessed to add a new note were
  //all accessed through context in our AddNote function so thats easily reusable except we pass handleEdit instead of handleAdd.

  render() {
    const value = {
      notes: this.state.notes,
      folders: this.state.folders,
      addFolder: this.handleAddFolder,
      addNote: this.handleAddNote,
      deleteNote: this.handleDeleteNote,
      editNote: this.handleEditNote
    };
    return (
      <ApiContext.Provider value={value}>
        <div className="App">
          <nav className="App__nav">{this.renderNavRoutes()}</nav>
          <header className="App__header">
            <h1>
              <Link to="/">Noteful</Link>{" "}
              <FontAwesomeIcon icon="check-double" />
            </h1>
          </header>
          <main className="App__main">{this.renderMainRoutes()}</main>
        </div>
      </ApiContext.Provider>
    );
  }
}

export default App;
