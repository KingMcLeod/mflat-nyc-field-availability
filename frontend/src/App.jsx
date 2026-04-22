import SearchForm from "./components/SearchForm"

export default function App() {
  function handleSearch(params) {
    console.log("search params:", params)
  }
  return (
    <div className="bg-blue-500 text-white p-8">
      <SearchForm onSearch={handleSearch} loading={false} />
    </div>
  )
}