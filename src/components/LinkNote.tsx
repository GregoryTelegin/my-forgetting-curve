import React, {useState, useEffect, useRef, useCallback} from 'react'
import {Modal, Button, List, Input} from 'antd'
import {LinkOutlined, CloseOutlined, GlobalOutlined} from '@ant-design/icons'
import {Note} from '~/components/types/Note'

const LinkNote: React.FC<{
  linkNote?: string;
  app: any;
  onSave: (node: Note, newValue: string) => void;
  node: Note;
  className: string;
}> = ({linkNote: initialLinkNote, app, onSave, node, className}) => {
  const [linkNote, setLinkNote] = useState<string | undefined>(initialLinkNote)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [files, setFiles] = useState<any[]>([]) // Полный список файлов
  const [filteredFiles, setFilteredFiles] = useState<any[]>([]) // Отфильтрованный список
  const [searchTerm, setSearchTerm] = useState<string>('') // Значение поиска
  const modalContainerRef = useRef<HTMLDivElement | null>(null) // Реф для контейнера модального окна
  const searchInputRef = useRef<HTMLInputElement | null>(null) // Реф для поля ввода

  const handleOpenModal = useCallback(() => {
    const markdownFiles = app.vault.getMarkdownFiles()
    setFiles(markdownFiles)
    setFilteredFiles(markdownFiles)
    setIsModalVisible(true)
  }, [app])

  const handleModalCancel = useCallback(() => {
    setIsModalVisible(false)
    setSearchTerm('')
  }, [])

  const handleModalOk = useCallback((filePath: string) => {
    setLinkNote(filePath)
    onSave(node, filePath)
    setIsModalVisible(false)
  }, [])

  const handleClearLink = useCallback(() => {
    setLinkNote('')
    onSave(node, '')
  }, [])

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const term = e.target.value.toLowerCase()
      setSearchTerm(term)
      setFilteredFiles(
        term
          ? files.filter((file) => file.path.toLowerCase().includes(term))
          : files,
      )
    },
    [files],
  )

  useEffect(() => {
    if (isModalVisible) {
      setTimeout(() => {
        modalContainerRef.current?.focus()

        searchInputRef.current?.focus()
      }, 0)
    }
  }, [isModalVisible])

  const handleLinkClick = () => {
    if (linkNote) {
      window.open(
        `obsidian://open?vault=${app.vault.getName()}&file=${encodeURIComponent(linkNote)}`,
        "_blank"
      );
    }
  };

  return (
    <span className={className}>
      {!linkNote ? (
        <span>
          <LinkOutlined
            className="linkOutlinedIcon"
            onClick={handleOpenModal}
            style={{cursor: 'pointer', fontSize: '16px'}}
          />
        </span>
      ) : (
        <>
          <Button
            type="link"
            icon={<GlobalOutlined />}
            onClick={handleLinkClick}
            target="_blank"
            rel="noopener noreferrer"
            className="globalOutlinedButton"
          />
          <Button
            type="text"
            icon={<CloseOutlined/>}
            onClick={handleClearLink}
            style={{color: 'red'}}
            className="closeOutlinedButton"
          />
        </>
      )}

      <Modal
        title="Выбор документа"
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
        getContainer={false}
        className="modalSelectDoc"
      >
        <div
          ref={modalContainerRef}
          tabIndex={-1}
          style={{outline: 'none'}}
        >
          <Input
            autoFocus
            placeholder="Поиск документа..."
            value={searchTerm}
            onChange={handleSearch}
            className="filePathSearch"
            ref={(input) => {
              searchInputRef.current = input
            }}
          />

          <List
            dataSource={filteredFiles}
            renderItem={(file) => (
              <List.Item
                onClick={() => handleModalOk(file.path)}
                className="listFilePath"
              >
                {file.path}
              </List.Item>
            )}
          />
        </div>
      </Modal>
    </span>
  )
}

export default LinkNote
