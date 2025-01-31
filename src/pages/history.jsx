import React, { useState, useEffect } from 'react';
import { Table, Input, InputNumber, Popconfirm, Form, Typography, Space, Button } from 'antd';
import Server from '../server/server';
const { Search } = Input;


const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode = inputType === 'number' ? <InputNumber /> : <Input />;
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{
            margin: 0,
          }}
          rules={[
            {
              required: true,
              message: `Please Input ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const History = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [editingKey, setEditingKey] = useState('');

  useEffect(() => {
    // Server.getBookList().then((res) => {
    //   let newD = res.data.map((u, i) => {
    //     return { key: `${i}`, ...u }
    //   })
    //   setData(newD)
    // })

  }, [])

  const isEditing = (record) => record.key === editingKey;

  const edit = (record) => {
    form.setFieldsValue({
      book_id: '',
      borrow_date: '',
      id: '',
      return_date: '',
      user_id: '',
      ...record,
    });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);

      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });
        setData(newData);
        setEditingKey('');
      } else {
        newData.push(row);
        setData(newData);
        setEditingKey('');
      }
      if (newData[index].id) {
        Server.modifyBook(newData[index]).then((data) => {
          console.log(data)
        })
      } else {
        Server.addBook(newData[index]).then(() => {
          Server.getBookList().then((res) => {
            let newD = res.data.map((u, i) => {
              return { key: `${i}`, ...u }
            })
            setData(newD)
          })
        })
      }

    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const handleDelete = (key) => {
    const newData = data.filter((item) => item.key !== key);
    for (let u of data) {
      if (u.key === key) {
        Server.deleteBook(u.id).then((data) => {
          console.log(data)
        })
        continue;
      }
    }
    setData(newData);
  };

  const handleAdd = () => {
    const newData = {
      key: `${data.length}`,
      name: '',
      author: '',
      number: ``,
    };
    setData([...data, newData])
  };

  const onSearch = (id) => {
    if (!isNaN(+id)) {
      Server.showHistoryById(id).then((res) => {
        setData(res.data)
      })
    } else {
      Server.showHistoryByName(id).then((res) => {
        console.log(res.data)

        setData(res.data)
      })
    }
  }

  const columns = [
    {
      title: 'id',
      dataIndex: 'id',
      width: '10%',
      editable: false,
    },
    {
      title: 'book_name',
      dataIndex: 'book_name',
      width: '15%',
      editable: true,
    },
    {
      title: 'user_name',
      dataIndex: 'user_name',
      width: '20%',
      editable: true,
    },
    {
      title: 'borrow_date',
      dataIndex: 'borrow_date',
      width: '20%',
      editable: true,
    },
    {
      title: 'return_date',
      dataIndex: 'return_date',
      width: '20%',
      editable: true,
    },
  ];
  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: col.dataIndex === 'age' ? 'number' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });
  return (
    <>
      <Search placeholder="输入用户id或者书名" onSearch={onSearch} style={{ width: 200, marginLeft: 200 }} />
      <Form form={form} component={false}>
        <Table
          loadings
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          bordered
          dataSource={data}
          columns={mergedColumns}
          rowClassName="editable-row"
          pagination={{
            onChange: cancel,
          }}
        />
      </Form>
    </>
  );
};

export default History;
