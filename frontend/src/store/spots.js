import { csrfFetch } from "./csrf";

const GET_SPOTS = 'spots/getSpots'
const RECEIVE_SPOT = 'spots/receiveSpot'
const UPDATE_SPOT = 'spots/updateSpot'
const REMOVE_SPOT = 'spots/removeSpot'
const CLEAR_STATE = 'spots/clearState'

const getSpots = (spots) => ({
    type: GET_SPOTS,
    spots,
})

const receiveSpot = (spot) => ({
    type: RECEIVE_SPOT,
    spot,
})

const editSpot = (spot) => ({
    type: UPDATE_SPOT,
    spot
})

const removeSpot = (spotId) => ({
    type: REMOVE_SPOT,
    spotId
})

export const clearState = () => ({
    type: CLEAR_STATE
})


export const fetchSpots = () => async (dispatch) => {
    const res = await csrfFetch('/api/spots');
    const spots = await res.json();
    dispatch(getSpots(spots))
    // console.log(spots)
}

export const getSpotById = (id) => async (dispatch) => {
    const res = await csrfFetch(`/api/spots/${id}`)
    if(res.ok) {
        const spot = await res.json();
        dispatch(receiveSpot(spot))
        // console.log(spot)
    }
}

export const createSpot = (spot) => async (dispatch) => {
    try{
        const res = await csrfFetch('/api/spots', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(spot)
        })
        if(res.ok) {
            const newSpot = await res.json()
            dispatch(receiveSpot(newSpot))
            return newSpot.id
        } else {
            const errors = await res.json()
            return errors;
        }
    } catch (err) {
        return await err.json()
    }
}

export const updateSpot = (spot, id) => async (dispatch) => {
    try {
        const res = await csrfFetch(`/api/spots/${id}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(spot)
        })
        if(res.ok) {
            const spotEdit = await res.json();
            dispatch(editSpot(spotEdit))
            return spotEdit.id;
        } else {
            const errors = await res.json()
            return errors
        }
    } catch (err) {
        return await err.json()
    }
}

export const addImageToSpot = (spotId, preview, url) => async (dispatch) => {
    const res = await csrfFetch(`/api/spots/${spotId}/images`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({url, preview})
    })
    if(res.ok) {
        const newImage = await res.json()
        return newImage
    } else {
        const errors = await res.json()
        return errors;
    }
}

export const deleteSpot = (spotId) => async (dispatch) => {
    const res = await csrfFetch(`/api/spots/${spotId}`, {
        method: 'DELETE',
        headers: {'Content-Type': 'application/json'}
    });

    if(res.ok) {
        const spot = await res.json()
        dispatch(removeSpot(spotId))
        return spot
    }
}

const initialState = { allSpots: {}, singleSpot: {}}

const spotsReducer = (state = initialState, action) => {
    switch (action.type) {
      case GET_SPOTS:
        const newState ={...state};
        action.spots.Spots.forEach((spot) => {
            newState.allSpots[spot.id] = spot;
        });
        return newState;
      case RECEIVE_SPOT:
        const spotState = initialState.singleSpot;
        return {...state, singleSpot: action.spot}
      case UPDATE_SPOT:
        return {...state, allSpots: {...state.allSpots, [action.spot.id]: action.spot}}
      case REMOVE_SPOT:
        const spotsState = {...initialState.allSpots}
        delete spotsState[action.spotId]
        return spotsState;
      case CLEAR_STATE:
        return {...state, allSpots: {...state.allSpots}, singleSpot: {}}
      default:
        return state;
    }
}

export default spotsReducer;