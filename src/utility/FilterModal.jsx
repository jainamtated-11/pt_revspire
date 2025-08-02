import React, { useState, useContext, useEffect, useRef } from "react";
import { GlobalContext } from "../context/GlobalState.jsx";
import { InputBox } from "./CustomComponents";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faFilter, faCheck } from "@fortawesome/free-solid-svg-icons";
import { TbEdit, TbTrash } from "react-icons/tb";
import {
  text_field_types,
  text_field_type_conditions,
  int_field_types,
  int_field_type_conditions,
  date_field_types,
  date_field_types_conditions,
} from "../constants";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchAllFilterFieldsAsync,
  fetchFieldsAsync,
  fetchFilterDataAsync,
  SetFilterData,
  SetFilterConditions,
  SetFilterLogic,
  SetFilterApplied,
  SetFilterAppliedOn,
} from "../features/filter/fliterSlice";
import FilterClear from "../utility/FilterClear.jsx";
import useAxiosInstance from "../Services/useAxiosInstance.jsx";
import { useCookies } from "react-cookie";

const FilterModal = ({ queryTable }) => {
  const { viewer_id, baseURL } = useContext(GlobalContext);

  const [filterModal, setFilterModal] = useState(false);
  const [conditionModal, setConditionModal] = useState(false);
  const [isObjectIdPresent, setIsObjectIdPresent] = useState(false);
  const [isFieldPresent, setIsFieldPresent] = useState(false);
  const [isConditionPresent, setIsConditionPresent] = useState(false);
  const [isValuePresent, setIsValuePresent] = useState(false);
  const [cookies] = useCookies(["userData"]);
  const organisation_id = cookies.userData?.organisation?.id;

  const [condition, setCondition] = useState({
    filterTable: "",
    filterTableName: "",
    filterField: "",
    filterFieldName: "",
    filterFieldType: "",
    conditionType: "",
    conditionName: "",
    conditionValueType: "",
    conditionValueTypeName: "Relative",
    valueId: "",
    valueName: "",
    relativeValue: null,
    value: null,
  });
  const filterConditions = useSelector(
    (state) => state.filter.filterConditions
  );
  const filterLogic = useSelector((state) => state.filter.filterLogic);
  const filterApplied = useSelector((state) => state.filter.filterApplied);
  const filterAppliedOn = useSelector((state) => state.filter.filterAppliedOn);
  const filterData = useSelector((state) => state.filter.filterData);

  const [queryTableId, setQueryTableId] = useState("");

  const modalRef = useRef(null);
  const [editConditionOrder, setEditConditionOrder] = useState(0);

  const [toggleSlider, setToggleSlider] = useState(false);
  const [advanceLogic, setAdvanceLogic] = useState("");

  const filter = useSelector((state) => state.filter);

  const dispatch = useDispatch();

  const axiosInstance = useAxiosInstance();

  const getFilterCondition = async (queryTable) => {
    const [
      { data: tableData },
      { data: fieldData },
      { data: conditionTypeData },
      { data: conditionValueTypeData },
    ] = await Promise.all([
      axiosInstance.post(`${baseURL}/get-table-id`, { tablename: queryTable }),
      axiosInstance.post(`${baseURL}/get-filter-field-id`, {
        field_name: "owner",
      }),
      axiosInstance.post(`${baseURL}/get-condition-type-id`, {
        condition_type: "equals",
      }),
      axiosInstance.post(`${baseURL}/get-condition-value-type-id`, {
        condition_value_type: "Absolute",
      }),
    ]);

    // Additional filter condition for service_user when queryTable is crm_connection
    if (queryTable === "crm_connection") {
      const [{ data: serviceUserFieldData }] = await Promise.all([
        axiosInstance.post(`${baseURL}/get-filter-field-id`, {
          field_name: "service_user",
        }),
      ]);

      return [
        {
          // First condition (owner)
          order: 1,
          filterTable: tableData.id,
          filterField: fieldData.id,
          conditionType: conditionTypeData.id,
          conditionValueType: conditionValueTypeData.id,
          filterTableName: queryTable,
          filterFieldName: "owner",
          filterFieldType: "string",
          conditionName: "equals",
          conditionValueTypeName: "Absolute",
          valueId: "",
          valueName: "",
          relativeValue: null,
          value: viewer_id,
        },
        {
          // Second condition (service_user)
          order: 2,
          filterTable: tableData.id,
          filterField: serviceUserFieldData.id,
          conditionType: conditionTypeData.id,
          conditionValueType: conditionValueTypeData.id,
          filterTableName: queryTable,
          filterFieldName: "service_user",
          filterFieldType: "int",
          conditionName: "equals",
          conditionValueTypeName: "Absolute",
          valueId: "",
          valueName: "",
          relativeValue: null,
          value: 0,
        },
      ];
    }

    // Return single condition for other cases
    return {
      order: 1,
      filterTable: tableData.id,
      filterField: fieldData.id,
      conditionType: conditionTypeData.id,
      conditionValueType: conditionValueTypeData.id,
      filterTableName: queryTable,
      filterFieldName: "owner",
      filterFieldType: "string",
      conditionName: "equals",
      conditionValueTypeName: "Absolute",
      valueId: "",
      valueName: "",
      relativeValue: null,
      value: viewer_id,
    };
  };

  const getTableId = async (tablename) => {
    const { data } = await axiosInstance.post(`${baseURL}/get-table-id`, {
      tablename,
    });
    return data.id;
  };

  useEffect(() => {
    const fetchTableId = async () => {
      const queryTableId = await getTableId(queryTable);
      dispatch(
        fetchFieldsAsync({
          axiosInstance: axiosInstance,
          viewer_id: viewer_id,
          tableName: queryTableId,
          baseURL: baseURL,
          organisation_id,
        })
      );
      setQueryTableId(queryTableId);
    };

    fetchTableId();
  }, []);

  useEffect(() => {
    const fetchFilterCondition = async () => {
      try {
        const filterCondition = await getFilterCondition(queryTable);
        if (filterCondition) {
          dispatch(
            SetFilterConditions(
              Array.isArray(filterCondition)
                ? filterCondition
                : [filterCondition]
            )
          );
          const logic = Array.isArray(filterCondition) ? "( 1 AND 2 )" : "1";
          dispatch(SetFilterLogic(logic));

          dispatch(
            fetchFilterDataAsync({
              axiosInstance: axiosInstance,
              queryTable: Array.isArray(filterCondition)
                ? filterCondition[0].filterTable
                : filterCondition.filterTable,
              filtersets: Array.isArray(filterCondition)
                ? filterCondition
                : [filterCondition],
              filter_logic: logic,
              baseURL: baseURL,
              organisation_id,
            })
          );

          dispatch(SetFilterApplied(true));
          if (queryTable != "pitch") {
            dispatch(SetFilterAppliedOn(queryTable));
          } else {
            dispatch(SetFilterAppliedOn("pitch"));
          }
        }
      } catch (error) {
        console.error("Error fetching filter condition:", error);
      }
    };
    if (
      queryTable === "pitch" ||
      queryTable === "crm_connection" ||
      queryTable == "all_user"
    ) {
      fetchFilterCondition();
    }
  }, []);

  useEffect(() => {
    if (condition.filterTable != "") {
      dispatch(
        fetchFieldsAsync({
          axiosInstance: axiosInstance,
          viewer_id: viewer_id,
          tableName: condition.filterTable,
          baseURL: baseURL,
          organisation_id,
        })
      );
    }
  }, [queryTable, condition.filterTable, queryTableId]);

  useEffect(() => {
    if (filter.loading) {
      dispatch(
        fetchAllFilterFieldsAsync({
          axiosInstance: axiosInstance,
          viewer_id,
          baseURL: baseURL,
          organisation_id,
        })
      );
    }
  }, []);

  const ObjectOnChangeHandler = (e) => {
    const ObjectName = e.target.value;
    const foundObject = filter.objects.find(
      (object) => object.tablename === ObjectName
    );

    if (foundObject) {
      const ObjectId = foundObject.id;
      setIsObjectIdPresent(true);

      setCondition((prevState) => ({
        ...prevState,
        filterTable: ObjectId,
        filterTableName: ObjectName,
        filterField: "",
        filterFieldName: "",
        filterFieldType: "",
        conditionType: "",
        conditionName: "",
        conditionValueType: "",
        conditionValueTypeName: "Relative",
        valueId: "",
        valueName: "",
        relativeValue: null,
        value: null,
      }));
    } else {
      setIsObjectIdPresent(false);
    }
  };

  const FieldOnChangeHandler = (e) => {
    const FieldName = e.target.value;
    const Field = filter.fields.find((field) => field.name === FieldName);

    if (Field) {
      setIsFieldPresent(true);

      if (
        text_field_types.includes(Field.fieldType) ||
        int_field_types.includes(Field.fieldType)
      ) {
        setCondition((prevState) => ({
          ...prevState,
          filterField: Field.id,
          filterFieldName: Field.name,
          filterFieldType: Field.fieldType,
          conditionType: "",
          conditionName: "",
          conditionValueType: filter.value_types.find(
            (valueType) => valueType.name === "Absolute"
          ).id,
          conditionValueTypeName: "Absolute",
          valueId: "",
          valueName: "",
          relativeValue: null,
          value: null,
        }));
      } else {
        setCondition((prevState) => ({
          ...prevState,
          filterField: Field.id,
          filterFieldName: Field.name,
          filterFieldType: Field.fieldType,
          conditionType: "",
          conditionName: "",
          conditionValueType: filter.value_types.find(
            (valueType) => valueType.name === "Relative"
          ).id,
          conditionValueTypeName: "Relative",
          valueId: "",
          valueName: "",
          relativeValue: null,
          value: null,
        }));
      }
    } else {
      setIsFieldPresent(false);
    }
  };

  const ConditionOnChangeHandler = (e) => {
    const ConditionName = e.target.value;
    const condition = filter.condition_types.find(
      (c) => c.name === ConditionName
    );

    if (condition) {
      setIsConditionPresent(true);

      setCondition((prevState) => ({
        ...prevState,
        conditionType: condition.id,
        conditionName: condition.name,
        valueId: "",
        valueName: "",
        relativeValue: null,
        value: null,
      }));
    } else {
      setIsConditionPresent(false);
    }
  };

  const ValueTypeOnChangeHandler = (e) => {
    const ValueTypeName = e.target.value;
    const ValueType = filter.value_types.find((v) => v.name === ValueTypeName);

    setCondition((prevState) => ({
      ...prevState,
      conditionValueType: ValueType.id,
      conditionValueTypeName: ValueType.name,
      valueId: "",
      valueName: "",
      relativeValue: null,
      value: null,
    }));
  };

  const ValueOnChangeHandler = (e) => {
    const ValueName = e.target.value;
    const Value = filter.values.find((v) => v.name === ValueName);

    if (Value) {
      setIsValuePresent(true);

      setCondition((prevState) => ({
        ...prevState,
        relativeValue: Value.id,
        valueId: Value.id,
        valueName: Value.name,
      }));
    } else {
      // Set local state to false if Value is not present
      setIsValuePresent(false);
    }
  };

  const FilterPopUpAddButtonHandler = async () => {
    let filterLogic = "";
    if (toggleSlider == true) {
      let logic = advanceLogic.toLowerCase();
      if (logic.trim().charAt(0) !== "(") {
        logic = "( " + logic.trim();
      }
      if (logic.trim().charAt(logic.trim().length - 1) !== ")") {
        logic = logic.trim() + " )";
      }
      setAdvanceLogic(logic);
      dispatch(FilterLogic(logic.toUpperCase()));
    } else {
      if (filterConditions.length == 1) {
        filterLogic += "1";
      } else {
        for (let i = 0; i < filterConditions.length; i++) {
          if (i == 0) {
            filterLogic += `( ${i + 1} AND`;
          } else if (i + 1 == filterConditions.length) {
            filterLogic += ` ${i + 1} )`;
          } else {
            filterLogic += ` ${i + 1} AND`;
          }
        }
      }
      dispatch(SetFilterLogic(filterLogic));
    }
    if (queryTable != "pitch") {
      dispatch(SetFilterAppliedOn(queryTable));
    }
    dispatch(
      fetchFilterDataAsync({
        axiosInstance: axiosInstance,
        queryTable: queryTableId,
        filtersets: filterConditions,
        filter_logic: toggleSlider ? advanceLogic : filterLogic,
        baseURL: baseURL,
        organisation_id,
      })
    );
    dispatch(SetFilterApplied(true));
    setFilterModal(false);
    setIsConditionPresent(false);
    setIsValuePresent(false);
    setIsFieldPresent(false);
    setIsObjectIdPresent(false);

    setCondition({
      filterTable: "",
      filterTableName: "",
      filterField: "",
      filterFieldName: "",
      filterFieldType: "",
      conditionType: "",
      conditionName: "",
      conditionValueType: "",
      conditionValueTypeName: "Relative",
      valueId: "",
      valueName: "",
      relativeValue: null,
      value: null,
    });
  };

  const AddConditionHandler = () => {
    let newCondition = {};
    newCondition = {
      filterTable:
        queryTable == "pitch" || queryTable == "content" || queryTable == "tag"
          ? condition.filterTable
          : queryTableId,
      filterTableName:
        queryTable == "pitch" || queryTable == "content" || queryTable == "tag"
          ? condition.filterTableName
          : queryTable,
      filterField: condition.filterField,
      filterFieldName: condition.filterFieldName,
      filterFieldType: condition.filterFieldType,
      conditionType: condition.conditionType,
      conditionName: condition.conditionName,
      conditionValueType: condition.conditionValueType,
      conditionValueTypeName: condition.conditionValueTypeName,
      valueId: condition.valueId,
      valueName: condition.valueName,
      relativeValue: condition.relativeValue,
      value: condition.value,
      order: filterConditions.length + 1,
    };
    dispatch(SetFilterConditions([...filterConditions, newCondition]));
    setCondition({
      filterTable: "",
      filterTableName: "",
      filterField: "",
      filterFieldName: "",
      filterFieldType: "",
      conditionType: "",
      conditionName: "",
      conditionValueType: "",
      conditionValueTypeName: "Relative",
      valueId: "",
      valueName: "",
      relativeValue: null,
      value: null,
    });
    setConditionModal(false);
  };

  const RemoveConditionHandler = (condition) => {
    const updatedCriteriaConditions = [];
    let order = 1;

    for (let i = 0; i < filterConditions.length; i++) {
      if (condition != filterConditions[i].order) {
        updatedCriteriaConditions.push({
          ...filterConditions[i],
          order: order,
        });
        order++;
      }
    }
    dispatch(SetFilterConditions(updatedCriteriaConditions));
  };

  const EditConditionHandler = () => {
    const updatedFilterConditions = [];
    for (let i = 0; i < filterConditions.length; i++) {
      if (condition.order === filterConditions[i].order) {
        updatedFilterConditions.push(condition);
      } else {
        updatedFilterConditions.push(filterConditions[i]);
      }
    }
    setCondition({
      filterTable: "",
      filterTableName: "",
      filterField: "",
      filterFieldName: "",
      filterFieldType: "",
      conditionType: "",
      conditionName: "",
      conditionValueType: "",
      conditionValueTypeName: "Relative",
      valueId: "",
      valueName: "",
      relativeValue: null,
      value: null,
    });
    dispatch(SetFilterConditions(updatedFilterConditions));
  };

  const targetRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setFilterModal(false);
        setCondition({
          filterTable: "",
          filterTableName: "",
          filterField: "",
          filterFieldName: "",
          filterFieldType: "",
          conditionType: "",
          conditionName: "",
          conditionValueType: "",
          conditionValueTypeName: "Relative",
          valueId: "",
          valueName: "",
          relativeValue: null,
          value: null,
        });
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [modalRef, setFilterModal]);

  const handleFilterClear = () => {
    dispatch(SetFilterConditions([]));
    dispatch(SetFilterLogic(""));
    dispatch(SetFilterApplied(false));
    dispatch(SetFilterAppliedOn(""));
    dispatch(SetFilterData([]));
  };

  return (
    <div>
      <div
        className={`${
          filterApplied ? "flex  items-center gap-1" : "text-white"
        } `}
      >
        <button
          className={`border border-neutral-300 hover:bg-neutral-100 active:bg-neutral-200 text-neutral-800 px-3 py-1.5 rounded-lg dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition duration-300 ease-in-out flex items-center gap-2 `}
          onClick={() => {
            setFilterModal(!filterModal);
          }}
        >
          <FontAwesomeIcon icon={faFilter} />
          Filter
        </button>
        {filterApplied && <FilterClear onClickHandle={handleFilterClear} />}
      </div>

      {filterModal && (
        <div
          ref={modalRef}
          className="absolute shadow-md top-36 right-16 w-[500px] h-[570px] z-20 bg-white border border-neutral-300 mr-4  rounded-lg"
          style={{ zIndex: 99999999 }}
        >
          <div className="h-[520px]">
            <h1 className="font-semibold text-center  text-xl border-b-2 border-neutral-300 py-2">
              Add Filter
            </h1>
            <div className="px-3">
              <div className="mx-auto flex mt-3 mb-2">
                <button
                  className="border-2 btn-secondary  font-medium  text-sm px-5 py-1.5 text-center"
                  onClick={() => {
                    setConditionModal(true);
                  }}
                >
                  Add Criteria
                </button>
              </div>

              {filterConditions.length >= 2 && (
                <div className=" flex  gap-3  py-2 px-1">
                  <div className="text-md font-semibold ">Advance Logic </div>
                  <div>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        value=""
                        className="sr-only peer"
                        checked={toggleSlider}
                        onChange={() => {
                          setToggleSlider(!toggleSlider);
                        }}
                      />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  {toggleSlider && (
                    <div>
                      <input
                        type="text"
                        value={advanceLogic}
                        placeholder="Advance Logic"
                        className="px-2 border-2 rounded-md"
                        onChange={(e) => {
                          setAdvanceLogic(e.target.value.toUpperCase());
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* showing the existing conditions */}
              <div
                className={`gap-2 ${
                  filterConditions.length <= 7 ? "h-auto" : "overflow-y-auto"
                } ${
                  conditionModal && filterConditions?.length >= 3
                    ? "h-[145px] overflow-y-auto bg-yellow-400"
                    : ""
                } overflow-y-auto    ${
                  targetRef.current != null ? "h-[340px]  overflow-y-auto" : ""
                }`}
              >
                {console.log("filter condiiton here ==", filterConditions)}
                {filterConditions.map((con, index) =>
                  editConditionOrder !== con.order ? (
                    <div
                      key={con.order}
                      className="flex border border-neutral-300 items-center rounded-md gap-3 px-4 py-0.5 justify-between w-full mb-1"
                    >
                      <div className="flex justify-center items-center gap-2">
                        <span className="border-neutral-400 border size-[20px] flex justify-center items-center text-xs rounded-full bg-neutral-50  text-neutral-700 font-bold">
                          {index + 1}
                        </span>
                        <span className="text-sm text-neutral-700 font-semibold">
                          {con.filterTableName}
                        </span>
                        <div className="text-sm text-neutral-700 font-semibold">
                          {con.filterFieldName || con?.fieldName}
                        </div>
                        <div className="text-sm text-neutral-700 font-semibold">
                          {con.conditionName}
                        </div>
                        <div
                          className="truncate w-20 text-sm text-neutral-700 font-semibold"
                          title={
                            con.valueName.length > 0 ? con.valueName : con.value
                          }
                        >
                          {con.valueName.length > 0 ? con.valueName : con.value}
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <button
                          className="pt-1 font-bold hover:text-blue-700"
                          onClick={() => {
                            console.log(
                              "Edit button clicked for condition:",
                              con
                            );
                            console.log("Current condition order:", con.order);
                            setCondition(con);
                            setEditConditionOrder(con.order);
                          }}
                        >
                          <TbEdit />
                        </button>
                        <button
                          onClick={() => {
                            RemoveConditionHandler(con.order);
                          }}
                          className="font-bold hover:text-red-500"
                        >
                          <TbTrash />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div key={con.order}>
                      <div
                        ref={targetRef}
                        className="border-2 rounded-xl px-2 py-1 space-y-1"
                      >
                        {(queryTable == "pitch" ||
                          queryTable == "content" ||
                          queryTable == "tag") && (
                          <InputBox
                            label="Object"
                            data={filter.objects}
                            OnChangeHandler={ObjectOnChangeHandler}
                            value={condition.filterTableName}
                          />
                        )}

                        <InputBox
                          label="Field"
                          data={filter.fields}
                          OnChangeHandler={FieldOnChangeHandler}
                          value={condition.filterFieldName}
                        />

                        <InputBox
                          label="Condition"
                          data={
                            condition.filterFieldType != ""
                              ? text_field_types.includes(
                                  condition.filterFieldType
                                )
                                ? text_field_type_conditions
                                : int_field_types.includes(
                                    condition.filterFieldType
                                  )
                                ? int_field_type_conditions
                                : date_field_types_conditions
                              : filter.condition_types
                          }
                          OnChangeHandler={ConditionOnChangeHandler}
                          value={condition.conditionName}
                        />

                        <InputBox
                          label="Value Type"
                          data={filter.value_types}
                          OnChangeHandler={ValueTypeOnChangeHandler}
                          value={condition.conditionValueTypeName}
                        />

                        {condition.conditionValueTypeName === "Relative" && (
                          <div className="flex justify-between items-end">
                            <InputBox
                              label="Value"
                              data={filter.values}
                              OnChangeHandler={ValueOnChangeHandler}
                              value={condition.valueName}
                            />
                            <div className="flex space-x-2 ">
                              <button
                                className="border border-neutral-300 hover:bg-neutral-100 active:bg-neutral-200 text-neutral-800 px-2 py-1 rounded-md dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition duration-300 ease-in-out text-sm"
                                disabled={
                                  condition.valueName == null ||
                                  condition.valueName == "" ||
                                  condition.filterTable == "" ||
                                  condition.filterField == "" ||
                                  condition.conditionType == "" ||
                                  condition.conditionValueType == ""
                                }
                                onClick={() => {
                                  EditConditionHandler();
                                  setEditConditionOrder(0);
                                }}
                              >
                                <FontAwesomeIcon icon={faCheck} />
                              </button>

                              <button
                                className="border border-neutral-300 hover:bg-neutral-100 active:bg-neutral-200 text-neutral-800 px-2 py-1 rounded-md dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition duration-300 ease-in-out text-sm"
                                onClick={() => {
                                  setEditConditionOrder(0);
                                  setConditionModal(false);
                                  setCondition({
                                    filterTable: "",
                                    filterTableName: "",
                                    filterField: "",
                                    filterFieldName: "",
                                    filterFieldType: "",
                                    conditionType: "",
                                    conditionName: "",
                                    conditionValueType: "",
                                    conditionValueTypeName: "Relative",
                                    valueId: "",
                                    valueName: "",
                                    relativeValue: null,
                                    value: null,
                                  });
                                }}
                              >
                                <FontAwesomeIcon icon={faXmark} />
                              </button>
                            </div>
                          </div>
                        )}

                        {condition.conditionValueTypeName == "Absolute" && (
                          <div className=" flex justify-between items-end">
                            <div className="flex items-center">
                              <label className="sm:w-28 text-sm font-medium text-gray-700">
                                Value :
                              </label>
                              <input
                                type={
                                  date_field_types.includes(
                                    condition.filterFieldType
                                  )
                                    ? "datetime-local"
                                    : "text"
                                }
                                placeholder="Enter the value"
                                className="w-48 border border-gray-300 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 p-1 dark:border-gray-500 dark:placeholder-gray-400 dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                value={condition.value}
                                onChange={(e) => {
                                  setCondition((prevState) => ({
                                    ...prevState,
                                    value: e.target.value,
                                    relativeValue: null,
                                  }));
                                }}
                              />
                            </div>
                            <div className="flex space-x-2">
                              <button
                                className="border border-neutral-300 hover:bg-neutral-100 active:bg-neutral-200 text-neutral-800 px-2 py-1 rounded-md dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition duration-300 ease-in-out text-sm"
                                disabled={
                                  condition.value == null ||
                                  condition.value == "" ||
                                  condition.filterTable == "" ||
                                  condition.filterField == "" ||
                                  condition.conditionType == "" ||
                                  condition.conditionValueType == ""
                                }
                                onClick={() => {
                                  EditConditionHandler();
                                  setEditConditionOrder(0);
                                }}
                              >
                                <FontAwesomeIcon icon={faCheck} />
                              </button>

                              <button
                                className="border border-neutral-300 hover:bg-neutral-100 active:bg-neutral-200 text-neutral-800 px-2 py-1 rounded-md dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition duration-300 ease-in-out text-sm"
                                onClick={() => {
                                  setEditConditionOrder(0);
                                  setCondition({
                                    filterTable: "",
                                    filterTableName: "",
                                    filterField: "",
                                    filterFieldName: "",
                                    filterFieldType: "",
                                    conditionType: "",
                                    conditionName: "",
                                    conditionValueType: "",
                                    conditionValueTypeName: "Relative",
                                    valueId: "",
                                    valueName: "",
                                    relativeValue: null,
                                    value: null,
                                  });
                                  setConditionModal(false);
                                }}
                              >
                                <FontAwesomeIcon icon={faXmark} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>

              {conditionModal && (
                <div className="border-2 rounded-xl px-2 py-1 space-y-1">
                  {(queryTable == "pitch" ||
                    queryTable == "content" ||
                    queryTable == "tag") && (
                    <InputBox
                      label="Object"
                      data={filter.objects}
                      OnChangeHandler={ObjectOnChangeHandler}
                      value={condition.filterTableName}
                    />
                  )}
                  <InputBox
                    label="Field"
                    data={filter.fields}
                    OnChangeHandler={FieldOnChangeHandler}
                    value={condition.filterFieldName}
                  />

                  <InputBox
                    label="Condition"
                    data={
                      condition.filterFieldType != ""
                        ? text_field_types.includes(condition.filterFieldType)
                          ? text_field_type_conditions
                          : int_field_types.includes(condition.filterFieldType)
                          ? int_field_type_conditions
                          : date_field_types_conditions
                        : filter.condition_types
                    }
                    OnChangeHandler={ConditionOnChangeHandler}
                    value={condition.conditionName}
                  />

                  <InputBox
                    label="Value Type"
                    data={
                      ["updated_at", "created_at"].includes(
                        condition.filterFieldName
                      )
                        ? filter.value_types
                        : filter.value_types.filter(
                            (value) => value.name != "Relative"
                          )
                    }
                    OnChangeHandler={ValueTypeOnChangeHandler}
                    value={condition.conditionValueTypeName}
                  />

                  {condition.conditionValueTypeName === "Relative" && (
                    <div className="flex justify-between items-end">
                      <InputBox
                        label="Value"
                        data={filter.values}
                        OnChangeHandler={ValueOnChangeHandler}
                        value={condition.valueName}
                      />
                      <div className="flex space-x-2">
                        <button
                          className="border border-neutral-300 hover:bg-neutral-100 active:bg-neutral-200 text-neutral-800 px-2 py-1 rounded-md dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition duration-300 ease-in-out text-sm"
                          disabled={
                            condition.valueName == null ||
                            condition.valueName == "" ||
                            condition.conditionType == "" ||
                            condition.conditionValueType == ""
                          }
                          onClick={AddConditionHandler}
                        >
                          <FontAwesomeIcon icon={faCheck} />
                        </button>
                        <button
                          className="border border-neutral-300 hover:bg-neutral-100 active:bg-neutral-200 text-neutral-800 px-2 py-1 rounded-md dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition duration-300 ease-in-out text-sm"
                          onClick={() => {
                            setConditionModal(false);
                            setCondition({
                              filterTable: "",
                              filterTableName: "",
                              filterField: "",
                              filterFieldName: "",
                              filterFieldType: "",
                              conditionType: "",
                              conditionName: "",
                              conditionValueType: "",
                              conditionValueTypeName: "Relative",
                              valueId: "",
                              valueName: "",
                              relativeValue: null,
                              value: null,
                            });
                          }}
                        >
                          <FontAwesomeIcon icon={faXmark} />
                        </button>
                      </div>
                    </div>
                  )}

                  {condition.conditionValueTypeName == "Absolute" && (
                    <div className="flex justify-between items-end">
                      <div className="flex items-center">
                        <label className="sm:w-28 text-sm font-medium text-gray-700">
                          Value:
                        </label>
                        <input
                          type={
                            date_field_types.includes(condition.filterFieldType)
                              ? "datetime-local"
                              : int_field_types.includes(
                                  condition.filterFieldType
                                )
                              ? "number"
                              : "text"
                          }
                          placeholder="Enter the value"
                          className="w-48 border border-gray-300 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 p-1 dark:border-gray-500 dark:placeholder-gray-400 dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          value={
                            condition.filterFieldName == "owner" &&
                            condition.filterTableName == "pitch"
                              ? viewer_id
                              : condition.value == null
                              ? ""
                              : condition.value
                          }
                          onChange={(e) => {
                            setCondition((prevState) => ({
                              ...prevState,
                              value:
                                condition.filterFieldName == "owner" &&
                                condition.filterTableName == "pitch"
                                  ? viewer_id
                                  : e.target.value,
                              relativeValue: null,
                            }));
                            setIsValuePresent(true);
                          }}
                        />
                      </div>
                      <div className="flex space-x-2">
                        <button
                          className="border border-neutral-300 hover:bg-neutral-100 active:bg-neutral-200 text-neutral-800 px-2 py-1 rounded-md dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition duration-300 ease-in-out text-sm"
                          onClick={AddConditionHandler}
                          disabled={
                            condition.value == null ||
                            condition.value == "" ||
                            condition.conditionType == "" ||
                            condition.conditionValueType == ""
                          }
                        >
                          <FontAwesomeIcon icon={faCheck} />
                        </button>
                        <button
                          className="border border-neutral-300 hover:bg-neutral-100 active:bg-neutral-200 text-neutral-800 px-2 py-1 rounded-md dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition duration-300 ease-in-out text-sm"
                          onClick={() => {
                            setConditionModal(false);
                            setCondition({
                              filterTable: "",
                              filterTableName: "",
                              filterField: "",
                              filterFieldName: "",
                              filterFieldType: "",
                              conditionType: "",
                              conditionName: "",
                              conditionValueType: "",
                              conditionValueTypeName: "Relative",
                              valueId: "",
                              valueName: "",
                              relativeValue: null,
                              value: null,
                            });
                          }}
                        >
                          <FontAwesomeIcon icon={faXmark} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-center items-center  space-x-10">
            <button
              className="px-4 py-2 w-20 text-sm text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition-colors border border-red-200"
              onClick={() => {
                setFilterModal(false);
                setConditionModal(false);
                setCondition({
                  filterTable: "",
                  filterTableName: "",
                  filterField: "",
                  filterFieldName: "",
                  filterFieldType: "",
                  conditionType: "",
                  conditionName: "",
                  conditionValueType: "",
                  conditionValueTypeName: "Relative",
                  valueId: "",
                  valueName: "",
                  relativeValue: null,
                  value: null,
                });
              }}
            >
              Cancel
            </button>

            <button
              className="px-6 py-2 w-20 flex justify-center items-center text-sm btn-secondary text-white rounded-lg transition-colors"
              disabled={filterConditions.length == 0}
              onClick={FilterPopUpAddButtonHandler}
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default FilterModal;
