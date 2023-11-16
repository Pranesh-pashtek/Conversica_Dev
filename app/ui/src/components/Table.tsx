import React from "react";
import { useTable } from 'react-table'
import { auto } from "@popperjs/core";


function Table() {
    const data = React.useMemo(() =>
 [
 {
 name: 'Alexis Taylor',
 Skills: '6',
 Conversation: '37',
 Type: 'EmailSMS',
 Contact: 313,
 },
 {
 name: 'Andrea Martinez',
 Skills: '8',
 Conversation: '75',
 Type: 'Email',
 Contact: 313,
 },
 {
 name: 'Ashley Martin',
 Skills: '11',
 Conversation: '126',
 Type: 'EmailSMS',
 Contact: 313,
 },
 {
 name: 'Brenda Jennings',
 Skills: '6',
 Conversation: '45',
 Type: 'EmailSMS',
 Contact: 313,
 },
 ],
 []
)
const columns = React.useMemo(
    () => [
    {
    Header: '4 Assistants',
    columns: [
    {
    Header: 'Name',
    accessor: 'name',
    },
    ],
    },
    {
    Header: 'Conversica',
    columns: [
    {
    Header: 'Skills',
    accessor: 'Skills',
    },
    ],
    },
    {
    Header: 'Conversica',
    columns: [
    {
    Header: 'Conversation(s)',
    accessor: 'Conversation',
    },
    {
    Header: 'Type(s)',
    accessor: 'Type',
    },
    {
    Header: 'Contact',
    accessor: 'contact',
    },
    {
    Header: 'Modified',
    accessor: 'modified',
    },
    ],
    },
    ],
    []
   )

   const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
   } = useTable({ columns, data })

    return (

        <table style={{alignItems: "center", width: "77%" }}className="table" {...getTableProps()}>
            <thead>
                {headerGroups.map(headerGroup => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map(column => (
                            <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                        ))}
                    </tr>
                ))}
            </thead>
            <tbody {...getTableBodyProps()}>
                {rows.map((row, i) => {
                    prepareRow(row)
                    return (
                        <tr {...row.getRowProps()}>
                            {row.cells.map(cell => {
                                return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                            })}
                        </tr>
                    )
                })}
            </tbody>
        </table>
    )
}

export default Table;