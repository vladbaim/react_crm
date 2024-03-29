import React, {useState, useContext} from "react"
import {Form} from "semantic-ui-react"
import Modal from "./modal"
import {ModelPage} from "containers"
import {ItemsContext} from "context"
import {request} from "actions"
import {modelsApi} from "utils/api"

export default ({multi, modelName, value, setValue, field}) => {
	if (!modelName) return "No model"

	if (!multi && value !== null && typeof value === "object") {
		setValue(null)
		return ""
	}
	if (
		multi &&
		(value === null || typeof value !== "object" || !Array.isArray(value))
	) {
		setValue([])
		return ""
	}
	const {store} = useContext(ItemsContext)
	const [search, setSearch] = useState("")
	const [model, setModel] = useState(null)
	const [pages, setPages] = useState([])
	const [state, setState] = useState(null)
	const [onLoad, setOnLoad] = useState(false)

	const SetModelByName = () => {
		setModel(store.models?.find((obj) => obj?.name === modelName))
	}

	if (model === null) {
		SetModelByName()
		return ""
	}

	const clear = () => {
		if (multi) setValue([])
		else setValue(null)
	}

	const onSearch = (searchVal) => {
		setSearch(searchVal)
		getPage(1, searchVal)
	}

	const onSelectItem = (status, id) => {
		if (multi) {
			if (status === true) {
				let idsHolder = value.slice()
				idsHolder.push(id)
				setValue(idsHolder)
			} else {
				let idsHolder = value.slice()
				idsHolder.splice(idsHolder.indexOf(idsHolder.find((i) => i === id)), 1)
				setValue(idsHolder)
			}
			return
		}
		if (status === true) {
			setValue(id)
		} else {
			setValue(null)
		}
	}

	const getPage = (page, withSearch) => {
		setOnLoad(true)
		request(
			modelsApi,
			"get",
			`?model=${model?.name}&image=list&search=${
				withSearch !== undefined ? withSearch : search
			}&page=${page}&limit=5`,
			null,
			(data) => setPage(data, withSearch)
		)
	}

	const setPage = (data, withSearch) => {
		let pagesHolder
		if (withSearch !== undefined) {
			setPages([])
			pagesHolder = []
		} else pagesHolder = pages.slice()

		setState(data)
		pagesHolder.push(data)
		setPages(pagesHolder)
		setOnLoad(false)
	}

	if (model !== null && state === null && onLoad === false) {
		getPage(1)
	}

	return (
		<Form.Group inline>
			{model !== null ? (
				<Modal
					model={model?.name}
					field={field}
					clear={clear}
					search={search}
					setSearch={onSearch}
					multi={multi}
					selected={multi ? value.length : (value !== null).toString()}
				>
					<ModelPage
						pageModel={model?.name}
						selected={value}
						onSelect={onSelectItem}
						multi={multi}
					/>
				</Modal>
			) : (
				""
			)}
		</Form.Group>
	)
}
