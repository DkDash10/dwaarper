import React from 'react'
import { Link } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { LuUserRoundSearch } from "react-icons/lu";

export default function Navigationbar() {
  return (
    <nav className="navigationbar">
      <div className='nav_container' >
        <Link to="/">DwaarPer</Link>
        <div className="nav_links" gap={3}>
          <Form className='nav_form'>
            <Row>
              <Col xs="auto">
                <input type="text" placeholder="Search"className="mr-sm-2 nav_search"/>
              </Col>
              <Col xs="auto">
                <button type="button" ><LuUserRoundSearch  className="nav_searchicon" /></button>
              </Col>
            </Row>
          </Form>
          <Link className="nav_links" to="/">Home</Link>
          <Link className="nav_links"to="/login">Login</Link>
        </div>
      </div>
    </nav>
  )
}
