'use client'
import { useState, useEffect } from 'react'
import { Box, Stack, Typography, Button, Modal, TextField, InputAdornment } from '@mui/material'
import { firestore } from '@/firebase'
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '@/firebase'  // Ensure Firebase storage is correctly imported

import Head from 'next/head'
import { createTheme, ThemeProvider } from '@mui/material/styles'

// Custom theme with updated colors and font
const theme = createTheme({
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h4: {
      fontSize: '1.5rem',
    },
    h5: {
      fontSize: '1.2rem',
    },
    h6: {
      fontSize: '1rem',
    },
    body1: {
      fontSize: '0.875rem',
    },
  },
  palette: {
    primary: {
      main: '#6a994e', // Earthy Green for Primary Buttons
    },
    secondary: {
      main: '#d9ed92', // Soft Green for Secondary Buttons
    },
    error: {
      main: '#d9534f', // Red for Clear List Button
    },
    background: {
      default: '#f4f1eb', // Light Beige Background
    },
    text: {
      primary: '#333333', // Dark Gray Text
    },
  },
})

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%', // Adjust width to fit on screen
  maxWidth: 400,
  bgcolor: '#ffffff', // White for Modal Background
  border: '2px solid #6a994e', // Earthy Green Border
  boxShadow: 24,
  p: 2,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
}

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [filteredInventory, setFilteredInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [itemQuantity, setItemQuantity] = useState('')
  const [itemImage, setItemImage] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() })
    })
    setInventory(inventoryList)
    setFilteredInventory(inventoryList)
  }

  const addItem = async (item, quantity, image) => {
    const itemNameLowerCase = item.toLowerCase()
    const docRef = doc(collection(firestore, 'inventory'), itemNameLowerCase)
    const docSnap = await getDoc(docRef)
    let imageUrl = null

    if (image) {
      const imageRef = ref(storage, `images/${itemNameLowerCase}`)
      await uploadBytes(imageRef, image)
      imageUrl = await getDownloadURL(imageRef)
    }

    if (docSnap.exists()) {
      const { quantity: existingQuantity } = docSnap.data()
      await setDoc(docRef, { quantity: existingQuantity + quantity, image: imageUrl }, { merge: true })
    } else {
      await setDoc(docRef, { quantity: quantity, image: imageUrl })
    }
    await updateInventory()
  }

  const removeItem = async (item) => {
    const itemNameLowerCase = item.toLowerCase()
    const docRef = doc(collection(firestore, 'inventory'), itemNameLowerCase)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      if (quantity === 1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, { quantity: quantity - 1 })
      }
    }
    await updateInventory()
  }

  const clearInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const deletePromises = docs.docs.map(doc => deleteDoc(doc.ref))
    await Promise.all(deletePromises)
    await updateInventory()
  }

  const handleSearch = () => {
    const lowerCaseQuery = searchQuery.toLowerCase()
    const filtered = inventory.filter(item =>
      item.name.toLowerCase().includes(lowerCaseQuery)
    )
    setFilteredInventory(filtered)
  }

  useEffect(() => {
    updateInventory()
  }, [])

  useEffect(() => {
    handleSearch()
  }, [searchQuery])

  const handleOpen = () => setOpen(true)
  const handleClose = () => {
    setItemName('')
    setItemQuantity('')
    setItemImage(null)
    setOpen(false)
  }

  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title>Pantry Management</title>
      </Head>
      <Box
        width="100vw"
        height="100vh"
        display={'flex'}
        justifyContent={'center'}
        flexDirection={'column'}
        alignItems={'center'}
        gap={1}
        sx={{ backgroundColor: theme.palette.background.default }}
      >
        <Typography variant="h4" gutterBottom color={theme.palette.text.primary}>
          Pantry Management
        </Typography>
        <Typography variant="body1" align="center" paragraph color={theme.palette.text.primary}>
          Manage your pantry inventory with ease. Add new items, adjust quantities, and clear the entire list when needed. Keep track of what you have and never run out of essentials again!
        </Typography>
        <TextField
          id="search"
          label="Search Items"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Button variant="contained" color="secondary" size="small" onClick={handleSearch}>
                  Search
                </Button>
              </InputAdornment>
            ),
          }}
          sx={{ width: '80%', maxWidth: 400 }}
        />
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Typography id="modal-modal-title" variant="h6" component="h2" color={theme.palette.text.primary}>
              Add Item
            </Typography>
            <Stack width="100%" direction={'column'} spacing={1}>
              <TextField
                id="outlined-basic"
                label="Item"
                variant="outlined"
                fullWidth
                size="small"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
              <TextField
                id="outlined-quantity"
                label="Quantity"
                variant="outlined"
                type="number"
                fullWidth
                size="small"
                value={itemQuantity}
                onChange={(e) => setItemQuantity(Number(e.target.value))}
              />
              <input
                accept="image/*"
                type="file"
                onChange={(e) => setItemImage(e.target.files[0])}
                style={{ display: 'none' }}
                id="upload-image"
              />
              <label htmlFor="upload-image">
                <Button
                  variant="outlined"
                  component="span"
                  color="secondary"
                  size="small"
                >
                  Upload Image
                </Button>
              </label>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  addItem(itemName, itemQuantity, itemImage)
                  handleClose()
                }}
                size="small"
              >
                Add
              </Button>
            </Stack>
          </Box>
        </Modal>
        <Button variant="contained" color="primary" onClick={handleOpen} size="small">
          Add New Item
        </Button>
        <Button variant="contained" color="error" onClick={clearInventory} size="small">
          Clear List
        </Button>
        <Box border={'1px solid #6a994e'} width="90%" maxWidth="800px">
          <Box
            height="60px"
            bgcolor={'#e1e2e1'} // Light Gray Background for Header
            display={'flex'}
            justifyContent={'center'}
            alignItems={'center'}
          >
            <Typography variant={'h5'} color={'#333333'} textAlign={'center'}>
              Inventory Items
            </Typography>
          </Box>
          <Stack width="100%" height="calc(100vh - 320px)" spacing={1} overflow={'auto'}>
            {filteredInventory.map(({ name, quantity, image }) => (
              <Box
                key={name}
                width="100%"
                minHeight="120px"
                display={'flex'}
                justifyContent={'space-between'}
                alignItems={'center'}
                bgcolor={'#f9f9f9'} // Very Light Gray Background
                paddingX={2}
                border={'1px solid #d9ed92'} // Soft Green Border
                boxSizing="border-box"
              >
                <Typography variant={'h6'} color={'#333333'} textAlign={'center'}>
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Typography variant={'h6'} color={'#333333'} textAlign={'center'}>
                  Quantity: {quantity}
                </Typography>
                {image && <img src={image} alt={name} style={{ width: 80, height: 80 }} />}
                <Stack direction="row" spacing={1}>
                  <Button variant="contained" color="primary" size="small" onClick={() => addItem(name, 1)}>
                    Add
                  </Button>
                  <Button variant="contained" color="secondary" size="small" onClick={() => removeItem(name)}>
                    Remove
                  </Button>
                </Stack>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>
    </ThemeProvider>
  )
}








