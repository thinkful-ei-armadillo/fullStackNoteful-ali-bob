import React, { Component } from "react";
import NotefulForm from "../NotefulForm/NotefulForm";
import ApiContext from "../ApiContext";
import config from "../config";

export default class EditNote extends Component {
  static defaultProps = {
    history: {
      push: () => {}
    }
  };
  static contextType = ApiContext;

  handleEdit = e => {
    e.preventDefault();
    const noteId = this.props.id;
    console.log("noteid", noteId);
    const newNote = {
      name: e.target["note-name"].value,
      content: e.target["note-content"].value,
      folder_id: e.target["note-folder-id"].value,
      modified: new Date().toDateString()
    };
    fetch(`${config.API_ENDPOINT}/api/notes${noteId}`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(newNote)
    })
      .then(res => {
        if (!res.ok) return res.json().then(e => Promise.reject(e));
        return res.json();
      })
      .then(note => {
        this.context.editNote(noteId, newNote);
        this.props.history.push(`/folder/${note.folder_id}`);
      })
      .catch(error => {
        console.error({ error });
      });
  };

  render() {
    const { folders = [] } = this.context;
    return (
      <section className="EditNote">
        <h2>Edit a note</h2>
        <NotefulForm onSubmit={this.handleEdit}>
          <div className="field">
            <label htmlFor="note-name-input">Name</label>
            <input type="text" id="note-name-input" name="note-name" />
          </div>
          <div className="field">
            <label htmlFor="note-content-input">Content</label>
            <textarea id="note-content-input" name="note-content" />
          </div>
          <div className="field">
            <label htmlFor="note-folder-select">Folder</label>
            <select id="note-folder-select" name="note-folder-id">
              {folders.map(folder => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>
          <div className="buttons">
            <button type="submit">Edit note</button>
          </div>
        </NotefulForm>
      </section>
    );
  }
}
